// map.js - Area Map Viewer
//
// Layout strategy: "Euclidean sectioning".
//
// MUD areas are mostly - but not perfectly - Euclidean: walking N,E,S,W in a
// loop usually returns you to the start, but interiors (shops, guilds, cellars)
// are frequently glued onto the street grid on the same z level and would
// overlap it if placed by naive dead-reckoning.
//
// Instead of nudging rooms around (which destroys the true grid and produces an
// unreadable spaghetti), we keep dead-reckoning coordinates EXACT and split the
// floor into independent "sections" whenever a room would land on an occupied
// cell. Each section is drawn in its own framed district, and the few links
// between sections are rendered as compact portal stubs instead of long lines.
//
// On the reference area (midgaard.are) this yields ~85% of horizontal exits
// drawn as clean grid neighbours with zero room overlaps, versus ~34% and a
// vnum-ordered filler grid with the previous algorithm.

import { dirSimpleName, sectTypeName, EX_WINDOW, EX_ISDOOR, EX_HIDDEN } from './constants.js';
import { selectNode } from './tree.js';

const DIR_N = 0, DIR_E = 1, DIR_S = 2, DIR_W = 3, DIR_U = 4, DIR_D = 5;
const OPPOSITE = [DIR_S, DIR_W, DIR_N, DIR_E, DIR_D, DIR_U];
const DELTA = {
    [DIR_N]: { dx: 0, dy: -1 },
    [DIR_E]: { dx: 1, dy: 0 },
    [DIR_S]: { dx: 0, dy: 1 },
    [DIR_W]: { dx: -1, dy: 0 },
};

// Geometry (logical px)
const NODE_W = 104, NODE_H = 44;
const CELL_W = 132, CELL_H = 68;
const PADDING = 56;
const SECTION_GAP = 2;          // empty cells between packed sections
const SECTION_PAD = 14;         // px padding of the section frame
const MAX_CANVAS_DIM = 8192;    // hard canvas limit -> we scale, never crop
const ABSORB_MAX = 3;           // sections up to this size get merged into a host

const COLOR = {
    bg: '#fbfbfc',
    edge: '#4a8f4e',
    edgeOneWay: '#e08a20',
    edgeFar: '#8e8e93',
    portal: '#7a5cc4',
    external: '#c2571a',
    up: '#1f7ac4',
    down: '#9333b5',
    frame: '#c9ced6',
    frameText: '#8a919c',
    ghostUp: '#bcd6ec',
    ghostDown: '#dcc9ec',
    text: '#22262c',
    sub: '#7c848f',
};

const SECTOR_FILL = {
    0: '#eef1f4', 1: '#e4edf7', 2: '#eef6e6', 3: '#d8ecd6',
    4: '#e6ded2', 5: '#d8cbbb', 6: '#dcecf8', 7: '#c7e0f4',
    8: '#d3d8ee', 9: '#eaf6fb', 10: '#f7f0d2', 11: '#bcd8ef',
    12: '#d9ead3', 13: '#e8e4dc',
};
const SECTOR_BORDER = {
    0: '#98a1ad', 1: '#5b8fc4', 2: '#7fa863', 3: '#5a9c58',
    4: '#a08a6c', 5: '#8a7359', 6: '#69a5cf', 7: '#4e8dc0',
    8: '#7079b8', 9: '#71b6d3', 10: '#c9a83c', 11: '#4b86b4',
    12: '#7aa86e', 13: '#a99e8c',
};

// ---------------------------------------------------------------- state
let graph = null;
let floors = [];                // sorted ascending, each { z, sections, bounds }
let metrics = null;             // shared coordinate frame for every floor
let floorIndex = 0;
let minFloor = 0, maxFloor = 0;
let zoomLevel = 1;
let currentAreaName = '';
let showGhosts = true;
let showLongLinks = false;
let hoverVnum = null;
let selectedVnum = null;
const ZOOM_MIN = 0.1, ZOOM_MAX = 3.0, ZOOM_STEP = 0.15;

// ---------------------------------------------------------------- graph
function usableExit(door) {
    return door && door.VNumTo > 0 && !(door.exitFlags & EX_WINDOW);
}

function buildGraph(rooms) {
    const nodes = new Map();
    for (const r of rooms) {
        if (r.resetOnly) continue;
        nodes.set(r.VNum, {
            vnum: r.VNum, room: r, z: null, x: 0, y: 0,
            section: null, nbr: [], upDown: [], stubs: [],
        });
    }
    const edges = [], vertical = [];
    const seenPair = new Set();
    for (const [v, n] of nodes) {
        for (let d = 0; d <= 5; d++) {
            const door = n.room.doors[d];
            if (!usableExit(door)) continue;
            const t = door.VNumTo;
            const dest = nodes.get(t);
            if (!dest) { n.stubs.push({ dir: d, to: t }); continue; }
            const back = dest.room.doors[OPPOSITE[d]];
            const bidir = !!(back && back.VNumTo === v && !(back.exitFlags & EX_WINDOW));
            const flags = door.exitFlags || 0;
            if (bidir) {
                const k = Math.min(v, t) + ':' + Math.max(v, t) + ':' + Math.min(d, OPPOSITE[d]);
                if (seenPair.has(k)) continue;
                seenPair.add(k);
            }
            const edge = { from: v, to: t, dir: d, bidir, flags };
            if (d <= DIR_W) {
                edges.push(edge);
                n.nbr.push({ to: t, dir: d });
                if (bidir) dest.nbr.push({ to: v, dir: OPPOSITE[d] });
            } else {
                vertical.push(edge);
                n.upDown.push({ to: t, dir: d });
                if (bidir) dest.upDown.push({ to: v, dir: OPPOSITE[d] });
            }
        }
    }
    return { nodes, edges, vertical };
}

// Floor (z) assignment: multi-seed BFS, first visit wins.
// A conflicting later edge is an "anomaly": we keep the room where it is and
// let the link render as a cross-floor portal rather than teleporting the room.
function assignFloors(nodes) {
    let anomalies = 0;
    const order = [...nodes.keys()].sort((a, b) => a - b);
    for (const seed of order) {
        const s = nodes.get(seed);
        if (s.z !== null) continue;
        s.z = 0;
        const q = [seed];
        while (q.length) {
            const n = nodes.get(q.shift());
            for (let d = 0; d <= 5; d++) {
                const door = n.room.doors[d];
                if (!usableExit(door)) continue;
                const t = nodes.get(door.VNumTo);
                if (!t) continue;
                const nz = n.z + (d === DIR_U ? 1 : d === DIR_D ? -1 : 0);
                if (t.z === null) { t.z = nz; q.push(t.vnum); }
                else if (t.z !== nz) anomalies++;
            }
        }
    }
    return anomalies;
}

// ------------------------------------------------------------- sectioning
// Strict dead-reckoning BFS. A room whose ideal cell is already taken is NOT
// nudged - it is left for a later pass, which starts a fresh section with its
// own coordinate space. This keeps every placed exit geometrically exact.
function sectionFloor(nodes, list) {
    const unplaced = new Set(list.map(n => n.vnum));
    const degreeOf = v => nodes.get(v).nbr.filter(e => {
        const t = nodes.get(e.to);
        return t && t.z === nodes.get(v).z;
    }).length;
    const sections = [];

    while (unplaced.size) {
        let seed = null, seedDeg = -1;
        for (const v of unplaced) {
            const d = degreeOf(v);
            if (d > seedDeg || (d === seedDeg && v < seed)) { seed = v; seedDeg = d; }
        }
        const occ = new Map(), members = [];
        const sn = nodes.get(seed);
        sn.x = 0; sn.y = 0;
        occ.set('0,0', sn); members.push(sn); unplaced.delete(seed);
        const q = [sn];
        while (q.length) {
            const n = q.shift();
            for (const e of n.nbr) {
                const t = nodes.get(e.to);
                if (!t || t.z !== n.z || !unplaced.has(t.vnum)) continue;
                const d = DELTA[e.dir];
                const x = n.x + d.dx, y = n.y + d.dy, k = x + ',' + y;
                if (occ.has(k)) continue;               // -> deferred to a new section
                t.x = x; t.y = y;
                occ.set(k, t); members.push(t); unplaced.delete(t.vnum); q.push(t);
            }
        }
        sections.push({ members, occ, z: sn.z });
    }
    return sections;
}

// Tiny sections (a lone shop, a closet) are visual noise as standalone frames.
// Pull them into a bigger linked section at the nearest free cell that still
// respects the exit direction.
function absorbSatellites(nodes, sections) {
    const secOf = new Map();
    for (const s of sections) for (const m of s.members) secOf.set(m.vnum, s);

    let changed = true;
    while (changed) {
        changed = false;
        for (const s of sections) {
            if (s.absorbed || s.members.length > ABSORB_MAX) continue;
            let host = null, anchor = null, dir = -1, mine = null;
            for (const m of s.members) {
                for (const e of nodes.get(m.vnum).nbr) {
                    const t = nodes.get(e.to);
                    const ts = t && secOf.get(t.vnum);
                    if (!ts || ts === s || ts.z !== s.z) continue;
                    if (ts.members.length <= s.members.length) continue;
                    host = ts; anchor = t; dir = OPPOSITE[e.dir]; mine = m; break;
                }
                if (host) break;
            }
            if (!host) continue;

            const d = DELTA[dir];
            const ix = anchor.x + d.dx, iy = anchor.y + d.dy;
            let base = null;
            for (let r = 0; r <= 2 && !base; r++) {
                const cands = [];
                for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                    const x = ix + dx, y = iy + dy;
                    if (host.occ.has(x + ',' + y)) continue;
                    if (d.dx > 0 && x <= anchor.x) continue;
                    if (d.dx < 0 && x >= anchor.x) continue;
                    if (d.dy > 0 && y <= anchor.y) continue;
                    if (d.dy < 0 && y >= anchor.y) continue;
                    cands.push({ x, y, c: Math.abs(dx) + Math.abs(dy) });
                }
                cands.sort((a, b) => a.c - b.c);
                if (cands.length) base = cands[0];
            }
            if (!base) continue;

            const ox = base.x - mine.x, oy = base.y - mine.y;
            let fits = true;
            for (const m of s.members) {
                if (host.occ.has((m.x + ox) + ',' + (m.y + oy))) { fits = false; break; }
            }
            if (!fits) continue;
            for (const m of s.members) {
                m.x += ox; m.y += oy;
                host.occ.set(m.x + ',' + m.y, m);
                host.members.push(m);
                secOf.set(m.vnum, host);
            }
            s.absorbed = true;
            changed = true;
        }
    }
    return sections.filter(s => !s.absorbed);
}

function bboxOf(members) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const m of members) {
        if (m.x < minX) minX = m.x;
        if (m.y < minY) minY = m.y;
        if (m.x > maxX) maxX = m.x;
        if (m.y > maxY) maxY = m.y;
    }
    return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function translate(section, ox, oy) {
    for (const m of section.members) { m.x += ox; m.y += oy; }
}

function finalizeSection(s) {
    s.bounds = bboxOf(s.members);
    // Coordinates move during packing/realignment: rebuild the cell index.
    s.occ = new Map();
    for (const m of s.members) {
        m.section = s;
        m.laidOut = true;
        s.occ.set(m.x + ',' + m.y, m);
    }
}

// Stair links between two sections, reduced to the single translation that
// registers the most of them.
//
// For a link room m (in section u) -> room t (in section v), lining them up
// means shift(v) = shift(u) + (m - t). Several stairwells between the same two
// districts usually agree; when they disagree we take the majority.
function stairLinks(nodes, sections) {
    const pairs = new Map();
    for (const u of sections) {
        for (const m of u.members) {
            for (const e of nodes.get(m.vnum).upDown) {
                const t = nodes.get(e.to);
                if (!t || !t.section || t.section === u) continue;
                const v = t.section;
                if (u.seq > v.seq) continue;            // record each pair once
                const key = u.seq + '|' + v.seq;
                let rec = pairs.get(key);
                if (!rec) { rec = { u, v, offsets: new Map(), total: 0 }; pairs.set(key, rec); }
                const dx = m.x - t.x, dy = m.y - t.y;
                const k = dx + ',' + dy;
                const o = rec.offsets.get(k) || { dx, dy, n: 0 };
                o.n++;
                rec.offsets.set(k, o);
                rec.total++;
            }
        }
    }
    const links = [];
    for (const rec of pairs.values()) {
        let best = null;
        for (const o of rec.offsets.values()) if (!best || o.n > best.n) best = o;
        links.push({ u: rec.u, v: rec.v, dx: best.dx, dy: best.dy, weight: best.n, total: rec.total });
    }
    return links;
}

// Put every district into one shared coordinate frame so stairwells sit exactly
// on top of each other.
//
// The districts and their stair links form a graph. We grow a maximum spanning
// forest over it (heaviest link first, seeded from the biggest district) and
// propagate a translation along every tree edge. Each tree edge is then
// perfectly registered, which is the most any single layout can guarantee -
// remaining links are cycles whose geometry genuinely disagrees.
//
// The earlier greedy "move one section at a time if it improves" pass could not
// do this: it refused any move blocked by a neighbour, and never moved two
// districts together.
function registerStairwells(nodes, floorList) {
    const sections = [];
    for (const f of floorList) for (const s of f.sections) sections.push(s);
    sections.forEach((s, i) => { s.seq = i; s.shift = null; s.linkWeight = 0; });
    if (sections.length < 2) {
        for (const s of sections) s.shift = { x: 0, y: 0 };
        return;
    }

    const links = stairLinks(nodes, sections);
    const adj = new Map();
    for (const s of sections) adj.set(s, []);
    for (const l of links) {
        adj.get(l.u).push({ to: l.v, dx: l.dx, dy: l.dy, w: l.weight });
        adj.get(l.v).push({ to: l.u, dx: -l.dx, dy: -l.dy, w: l.weight });
        l.u.linkWeight += l.weight;
        l.v.linkWeight += l.weight;
    }

    // Seed from the largest district, then keep attaching whichever unplaced
    // district hangs off the heaviest link (Prim, max weight).
    const roots = [...sections].sort((a, b) => b.members.length - a.members.length);
    for (const root of roots) {
        if (root.shift) continue;
        root.shift = { x: 0, y: 0 };
        const frontier = [];
        const push = (s) => {
            for (const e of adj.get(s)) {
                if (e.to.shift) continue;
                frontier.push({ from: s, ...e });
            }
        };
        push(root);
        while (frontier.length) {
            frontier.sort((a, b) => b.w - a.w);
            const e = frontier.shift();
            if (e.to.shift) continue;
            e.to.shift = { x: e.from.shift.x + e.dx, y: e.from.shift.y + e.dy };
            e.to.anchored = true;
            push(e.to);
        }
    }
    for (const s of sections) if (!s.shift) s.shift = { x: 0, y: 0 };
    for (const s of sections) translate(s, s.shift.x, s.shift.y);
    for (const s of sections) finalizeSection(s);
}

// `halo` keeps a ring of empty cells around a district so its dashed frame has
// room to breathe. It must be 0 for stair-registered districts: their position
// is real, and a tomb directly under the crypt above it is legitimately
// adjacent to the tomb next door.
function sectionFits(taken, section, ox, oy, halo = 1) {
    for (const m of section.members) {
        const x = m.x + ox, y = m.y + oy;
        for (let gx = -halo; gx <= halo; gx++) for (let gy = -halo; gy <= halo; gy++) {
            if (taken.has((x + gx) + ',' + (y + gy))) return false;
        }
    }
    return true;
}

// Registration ignores collisions, so two districts on the same floor can now
// overlap. Resolve per floor: the district with the strongest stair support
// keeps its registered position, weaker ones spiral out to the nearest free
// spot, and districts with no stairs at all are shelf-packed into the margin.
function resolveFloorCollisions(floorList) {
    for (const floor of floorList) {
        const linked = floor.sections.filter(s => s.linkWeight > 0);
        const free = floor.sections.filter(s => s.linkWeight === 0);
        linked.sort((a, b) => b.linkWeight - a.linkWeight || b.members.length - a.members.length);
        free.sort((a, b) => {
            const ba = bboxOf(a.members), bb = bboxOf(b.members);
            return bb.h - ba.h || bb.w - ba.w;
        });

        const taken = new Map();
        const claim = s => { for (const m of s.members) taken.set(m.x + ',' + m.y, m); };

        for (const s of linked) {
            // Registered districts only have to avoid real cell overlap.
            if (sectionFits(taken, s, 0, 0, 0)) { s.registered = true; claim(s); continue; }
            let ox = 0, oy = 0, ok = false;
            for (let r = 1; r < 120 && !ok; r++) {
                for (let dx = -r; dx <= r && !ok; dx++) for (let dy = -r; dy <= r && !ok; dy++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                    if (sectionFits(taken, s, dx, dy, 1)) { ox = dx; oy = dy; ok = true; }
                }
            }
            translate(s, ox, oy);
            s.anchored = false;
            s.registered = false;
            finalizeSection(s);
            claim(s);
        }

        if (!free.length) continue;
        let originY = 0, minXAll = 0;
        if (taken.size) {
            let maxY = -Infinity; minXAll = Infinity;
            for (const m of taken.values()) {
                if (m.y > maxY) maxY = m.y;
                if (m.x < minXAll) minXAll = m.x;
            }
            originY = maxY + SECTION_GAP + 1;
        }
        const cellArea = free.reduce((sum, s) => {
            const bb = bboxOf(s.members);
            return sum + (bb.w + SECTION_GAP) * (bb.h + SECTION_GAP);
        }, 0);
        const TARGET_ASPECT = 1.6;
        const rowsEst = Math.sqrt((cellArea / 0.8) / (TARGET_ASPECT * CELL_H / CELL_W));
        const targetW = Math.max(8, Math.ceil(rowsEst * TARGET_ASPECT * CELL_H / CELL_W));

        let shelfX = minXAll, shelfY = originY, shelfH = 0;
        for (const s of free) {
            const bb = bboxOf(s.members);
            if (shelfX > minXAll && shelfX + bb.w - minXAll > targetW) {
                shelfX = minXAll; shelfY += shelfH + SECTION_GAP; shelfH = 0;
            }
            translate(s, shelfX - bb.minX, shelfY - bb.minY);
            finalizeSection(s);
            claim(s);
            shelfX += bb.w + SECTION_GAP;
            shelfH = Math.max(shelfH, bb.h);
        }
    }
    for (const floor of floorList) floor.bounds = bboxOf(floor.rooms);
}

function labelForSection(s) {
    let best = s.members[0];
    let bestDeg = -1;
    for (const m of s.members) {
        const deg = m.nbr.length;
        if (deg > bestDeg) { bestDeg = deg; best = m; }
    }
    return best.room.name || ('#' + best.vnum);
}

function layout(g) {
    const byFloor = new Map();
    for (const [, n] of g.nodes) {
        if (!byFloor.has(n.z)) byFloor.set(n.z, []);
        byFloor.get(n.z).push(n);
    }
    const zs = [...byFloor.keys()].sort((a, b) => a - b);
    const result = new Map();

    // 1. Cut each floor into districts with exact dead-reckoning coordinates.
    //    Every district still sits in its own local frame at this point.
    for (const z of zs) {
        const list = byFloor.get(z).sort((a, b) => a.vnum - b.vnum);
        let sections = sectionFloor(g.nodes, list);
        sections = absorbSatellites(g.nodes, sections);
        sections.forEach((s, i) => { s.id = z + '.' + i; s.label = labelForSection(s); });
        for (const s of sections) finalizeSection(s);
        result.set(z, { z, sections, rooms: list, bounds: bboxOf(list) });
    }
    const floorList = [...result.values()].sort((a, b) => a.z - b.z);

    // 2. Slide the districts into one shared frame so stairwells register.
    registerStairwells(g.nodes, floorList);
    // 3. Registration ignores collisions; separate whatever now overlaps.
    resolveFloorCollisions(floorList);
    return floorList;
}

// Classify each horizontal edge once, at layout time.
function classifyEdges(g) {
    for (const e of g.edges) {
        const a = g.nodes.get(e.from), b = g.nodes.get(e.to);
        if (!a || !b) { e.kind = 'dead'; continue; }
        if (a.z !== b.z) { e.kind = 'portal'; continue; }
        if (a.section !== b.section) { e.kind = 'portal'; continue; }
        const d = DELTA[e.dir];
        e.kind = (b.x - a.x === d.dx && b.y - a.y === d.dy) ? 'grid' : 'far';
    }
}

// ---------------------------------------------------------------- render
function cellCenter(x, y, ox, oy) {
    return { x: ox + x * CELL_W + CELL_W / 2, y: oy + y * CELL_H + CELL_H / 2 };
}

// One shared coordinate frame for the whole area.
//
// Every floor is drawn on an identically sized canvas with the same origin, so
// grid cell (x,y) always lands on the same pixel. That is what makes "this room
// sits directly above that one" verifiable: floors stay in register, the view
// does not jump when you change level, and the scroll position is preserved.
function areaMetrics(floorList) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const f of floorList) {
        for (const s of f.sections) {
            minX = Math.min(minX, s.bounds.minX); minY = Math.min(minY, s.bounds.minY);
            maxX = Math.max(maxX, s.bounds.maxX); maxY = Math.max(maxY, s.bounds.maxY);
        }
    }
    if (minX === Infinity) { minX = minY = 0; maxX = maxY = 0; }
    const cols = maxX - minX + 1, rows = maxY - minY + 1;
    return {
        minX, minY, maxX, maxY, cols, rows,
        width: cols * CELL_W + PADDING * 2,
        height: rows * CELL_H + PADDING * 2,
        ox: PADDING - minX * CELL_W,
        oy: PADDING - minY * CELL_H,
    };
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function fitText(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length && ctx.measureText(t + '\u2026').width > maxW) t = t.slice(0, -1);
    return t + '\u2026';
}

// Faint outline of the neighbouring floors, so the reader can see what sits
// above and below the current level.
function drawGhostFloor(ctx, floor, m, color) {
    if (!floor) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const s of floor.sections) {
        for (const n of s.members) {
            const c = cellCenter(n.x, n.y, m.ox, m.oy);
            roundRect(ctx, c.x - NODE_W / 2, c.y - NODE_H / 2, NODE_W, NODE_H, 6);
            ctx.stroke();
        }
    }
    ctx.restore();
}

// Only districts whose position is arbitrary get a frame. A district pinned by
// a staircase sits where it really belongs, so boxing it would be misleading -
// and on a floor of small stair-linked rooms (a crypt, a row of tombs) it would
// bury the map in dashed rectangles.
function drawSectionFrames(ctx, floor, m) {
    const framed = floor.sections.filter(s => !s.registered);
    if (framed.length < 2 && floor.sections.length < 2) return;
    ctx.save();
    for (const s of framed) {
        const a = cellCenter(s.bounds.minX, s.bounds.minY, m.ox, m.oy);
        const b = cellCenter(s.bounds.maxX, s.bounds.maxY, m.ox, m.oy);
        const x = a.x - NODE_W / 2 - SECTION_PAD;
        const y = a.y - NODE_H / 2 - SECTION_PAD;
        const w = (b.x + NODE_W / 2 + SECTION_PAD) - x;
        const h = (b.y + NODE_H / 2 + SECTION_PAD) - y;
        ctx.strokeStyle = COLOR.frame;
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        roundRect(ctx, x, y, w, h, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '600 11px sans-serif';
        ctx.fillStyle = COLOR.frameText;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        const label = fitText(ctx, s.label + '  \u00b7  ' + s.members.length, w - 8);
        ctx.fillText(label, x + 4, y - 3);
    }
    ctx.restore();
}

function edgeAnchor(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) * NODE_H >= Math.abs(dy) * NODE_W) {
        const sx = Math.sign(dx) || 1;
        return { x: from.x + sx * (NODE_W / 2), y: from.y };
    }
    const sy = Math.sign(dy) || 1;
    return { x: from.x, y: from.y + sy * (NODE_H / 2) };
}

function arrowHead(ctx, x, y, ux, uy, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - ux * size + uy * size * 0.45, y - uy * size - ux * size * 0.45);
    ctx.lineTo(x - ux * size - uy * size * 0.45, y - uy * size + ux * size * 0.45);
    ctx.closePath();
    ctx.fill();
}

// A normal exit between two grid neighbours: a short connector in the gap.
function drawGridEdge(ctx, a, b, edge, dim) {
    const p = edgeAnchor(a, b), q = edgeAnchor(b, a);
    const dx = q.x - p.x, dy = q.y - p.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx / len, uy = dy / len;
    const color = edge.bidir ? COLOR.edge : COLOR.edgeOneWay;
    ctx.save();
    ctx.globalAlpha = dim ? 0.25 : 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = edge.bidir ? 2 : 2.2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    if (!edge.bidir) arrowHead(ctx, q.x, q.y, ux, uy, 7, color);
    if (edge.flags & EX_ISDOOR) {
        const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
        ctx.fillStyle = (edge.flags & EX_HIDDEN) ? '#b03030' : '#ffffff';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

// Same section but not adjacent (non-Euclidean loop): a dashed curve.
function drawFarEdge(ctx, a, b, edge, dim) {
    const p = edgeAnchor(a, b), q = edgeAnchor(b, a);
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    const nx = -(q.y - p.y), ny = (q.x - p.x);
    const nl = Math.hypot(nx, ny) || 1;
    const bow = Math.min(46, nl * 0.18);
    const cx = mx + (nx / nl) * bow, cy = my + (ny / nl) * bow;
    ctx.save();
    ctx.globalAlpha = dim ? 0.15 : 0.75;
    ctx.strokeStyle = COLOR.edgeFar;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(cx, cy, q.x, q.y);
    ctx.stroke();
    ctx.setLineDash([]);
    const ux = (q.x - cx), uy = (q.y - cy), ul = Math.hypot(ux, uy) || 1;
    arrowHead(ctx, q.x, q.y, ux / ul, uy / ul, 6, COLOR.edgeFar);
    ctx.restore();
}

// Links that leave the section / floor / area: a stub with the target vnum.
// This is what keeps a complex map readable - no long lines across the canvas.
function drawStub(ctx, center, dir, text, color, dim) {
    const d = DELTA[dir];
    let ux, uy;
    if (d) { ux = d.dx; uy = d.dy; }
    else { ux = 0.72; uy = dir === DIR_U ? -0.72 : 0.72; }
    const sx = center.x + ux * (NODE_W / 2) * (d ? 1 : 0.82);
    const sy = center.y + uy * (NODE_H / 2) * (d ? 1 : 0.9);
    const len = 13;
    const ex = sx + ux * len, ey = sy + uy * len;
    ctx.save();
    ctx.globalAlpha = dim ? 0.3 : 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    arrowHead(ctx, ex, ey, ux, uy, 5.5, color);

    ctx.font = '9px monospace';
    const tw = ctx.measureText(text).width + 6;
    let lx = ex + ux * 4, ly = ey + uy * 4;
    if (ux > 0) lx += tw / 2; else if (ux < 0) lx -= tw / 2;
    if (uy > 0) ly += 5; else if (uy < 0) ly -= 5;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    roundRect(ctx, lx - tw / 2, ly - 6, tw, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, lx, ly);
    ctx.restore();
}

function drawRoom(ctx, n, m) {
    const c = cellCenter(n.x, n.y, m.ox, m.oy);
    const x = c.x - NODE_W / 2, y = c.y - NODE_H / 2;
    const sector = n.room.sectorType || 0;
    const isHover = hoverVnum === n.vnum;
    const isSel = selectedVnum === n.vnum;

    ctx.save();
    if (isHover || isSel) {
        ctx.shadowColor = 'rgba(30,90,180,0.45)';
        ctx.shadowBlur = 10;
    }
    ctx.fillStyle = SECTOR_FILL[sector] || '#f2f3f5';
    ctx.strokeStyle = isSel ? '#1b64c8' : (SECTOR_BORDER[sector] || '#9aa2ad');
    ctx.lineWidth = isSel ? 2.6 : (isHover ? 2.2 : 1.3);
    roundRect(ctx, x, y, NODE_W, NODE_H, 7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = COLOR.sub;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('#' + n.vnum, x + 7, y + 5);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = COLOR.text;
    ctx.fillText(fitText(ctx, n.room.name || '', NODE_W - 14), x + 7, y + 19);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = COLOR.sub;
    ctx.textBaseline = 'bottom';
    const sect = (sectTypeName[sector] || {}).name || '';
    ctx.fillText(fitText(ctx, sect, NODE_W - 40), x + 7, y + NODE_H - 4);

    // up/down badges in the top-right corner
    let bx = x + NODE_W - 6;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 9px sans-serif';
    for (const e of n.upDown) {
        const up = e.dir === DIR_U;
        const target = graph.nodes.get(e.to);
        const tz = target ? target.z : n.z + (up ? 1 : -1);
        const txt = (up ? '\u25b2' : '\u25bc') + tz;
        const w = ctx.measureText(txt).width + 6;
        ctx.fillStyle = up ? COLOR.up : COLOR.down;
        roundRect(ctx, bx - w, y + 4, w, 11, 3);
        ctx.globalAlpha = 0.18; ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = up ? COLOR.up : COLOR.down;
        ctx.fillText(txt, bx - 3, y + 5);
        bx -= w + 3;
    }
}

function drawFloor(ctx, floorIdx, m, opts = {}) {
    const floor = floors[floorIdx];
    ctx.fillStyle = COLOR.bg;
    ctx.fillRect(0, 0, m.width, m.height);
    if (!floor) {
        ctx.font = '14px sans-serif';
        ctx.fillStyle = COLOR.sub;
        ctx.textAlign = 'center';
        ctx.fillText('No rooms on this floor', m.width / 2, m.height / 2);
        return;
    }

    if (showGhosts && !opts.flat) {
        drawGhostFloor(ctx, floors[floorIdx - 1], m, COLOR.ghostDown);
        drawGhostFloor(ctx, floors[floorIdx + 1], m, COLOR.ghostUp);
    }
    drawSectionFrames(ctx, floor, m);

    const onFloor = v => {
        const n = graph.nodes.get(v);
        return n && n.z === floor.z;
    };
    const dimmed = e => hoverVnum !== null && e.from !== hoverVnum && e.to !== hoverVnum;

    // 1. non-adjacent links first (they sit under the boxes)
    for (const e of graph.edges) {
        if (e.kind !== 'far') continue;
        if (!onFloor(e.from) || !onFloor(e.to)) continue;
        drawFarEdge(ctx, cellCenter(graph.nodes.get(e.from).x, graph.nodes.get(e.from).y, m.ox, m.oy),
                    cellCenter(graph.nodes.get(e.to).x, graph.nodes.get(e.to).y, m.ox, m.oy), e, dimmed(e));
    }
    // 2. optional long lines for cross-section links
    if (showLongLinks) {
        for (const e of graph.edges) {
            if (e.kind !== 'portal') continue;
            if (!onFloor(e.from) || !onFloor(e.to)) continue;
            const a = graph.nodes.get(e.from), b = graph.nodes.get(e.to);
            ctx.save();
            ctx.globalAlpha = dimmed(e) ? 0.12 : 0.5;
            ctx.strokeStyle = COLOR.portal;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([2, 5]);
            ctx.beginPath();
            const p = cellCenter(a.x, a.y, m.ox, m.oy), q = cellCenter(b.x, b.y, m.ox, m.oy);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.restore();
        }
    }
    // 3. clean grid connectors
    for (const e of graph.edges) {
        if (e.kind !== 'grid') continue;
        if (!onFloor(e.from) || !onFloor(e.to)) continue;
        drawGridEdge(ctx, cellCenter(graph.nodes.get(e.from).x, graph.nodes.get(e.from).y, m.ox, m.oy),
                     cellCenter(graph.nodes.get(e.to).x, graph.nodes.get(e.to).y, m.ox, m.oy), e, dimmed(e));
    }
    // 4. rooms
    for (const s of floor.sections) for (const n of s.members) drawRoom(ctx, n, m);
    // 5. stubs on top
    for (const s of floor.sections) for (const n of s.members) {
        const c = cellCenter(n.x, n.y, m.ox, m.oy);
        const dim = hoverVnum !== null && hoverVnum !== n.vnum;
        for (const e of graph.edges) {
            if (e.kind !== 'portal') continue;
            let dir = -1, other = -1;
            if (e.from === n.vnum) { dir = e.dir; other = e.to; }
            else if (e.to === n.vnum && e.bidir) { dir = OPPOSITE[e.dir]; other = e.from; }
            else continue;
            const t = graph.nodes.get(other);
            const tag = (t && t.z !== n.z) ? '#' + other + '\u2191\u2193' : '#' + other;
            drawStub(ctx, c, dir, tag, COLOR.portal, dim);
        }
        for (const st of n.stubs) {
            if (st.dir > DIR_W) continue;
            drawStub(ctx, c, st.dir, '#' + st.to, COLOR.external, dim);
        }
    }
}

// ------------------------------------------------------------------- api
function currentMetrics() {
    return metrics;
}

function renderCurrentFloor() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas || !graph) return;
    const m = currentMetrics();
    if (!m) return;
    // Canvas geometry is identical on every floor, so switching level never
    // reflows the view: only the painted content changes.
    const dpr = window.devicePixelRatio || 1;
    // Scale down (never crop) if the floor exceeds the canvas limit.
    const fit = Math.min(1, MAX_CANVAS_DIM / (Math.max(m.width, m.height) * dpr));
    const scale = dpr * fit;
    canvas.width = Math.round(m.width * scale);
    canvas.height = Math.round(m.height * scale);
    canvas.style.width = (m.width * fit) + 'px';
    canvas.style.height = (m.height * fit) + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawFloor(ctx, floorIndex, m);
    canvas._mapMetrics = m;
    canvas._mapFit = fit;
}

function hitTest(clientX, clientY) {
    const canvas = document.getElementById('map-canvas');
    const m = canvas && canvas._mapMetrics;
    const floor = floors[floorIndex];
    if (!m || !floor) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) / rect.width * m.width;
    const sy = (clientY - rect.top) / rect.height * m.height;
    const gx = Math.floor((sx - m.ox) / CELL_W);
    const gy = Math.floor((sy - m.oy) / CELL_H);
    for (const s of floor.sections) {
        const n = s.occ.get(gx + ',' + gy);
        if (!n) continue;
        const c = cellCenter(n.x, n.y, m.ox, m.oy);
        if (Math.abs(sx - c.x) <= NODE_W / 2 && Math.abs(sy - c.y) <= NODE_H / 2) return n;
    }
    return null;
}

export function initMap() {
    const container = document.getElementById('map-canvas-container');
    if (!container) return;

    container.addEventListener('wheel', (e) => {
        if (!isMapOpen() || !e.ctrlKey) return;
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const cx = e.clientX - rect.left + container.scrollLeft;
        const cy = e.clientY - rect.top + container.scrollTop;
        const old = zoomLevel;
        zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel - e.deltaY * 0.01));
        applyZoom(cx, cy, old);
    }, { passive: false });

    container.addEventListener('mousemove', (e) => {
        if (!isMapOpen()) return;
        const n = hitTest(e.clientX, e.clientY);
        const v = n ? n.vnum : null;
        container.style.cursor = n ? 'pointer' : 'default';
        if (v !== hoverVnum) { hoverVnum = v; renderCurrentFloor(); updateHint(n); }
    });
    container.addEventListener('mouseleave', () => {
        if (hoverVnum !== null) { hoverVnum = null; renderCurrentFloor(); updateHint(null); }
    });
    container.addEventListener('click', (e) => {
        const n = hitTest(e.clientX, e.clientY);
        if (!n) return;
        selectedVnum = n.vnum;
        if (e.shiftKey) { renderCurrentFloor(); return; }
        closeMap();
        try { selectNode('room-' + n.vnum); } catch (_) { /* room not in tree */ }
    });

    document.getElementById('map-ghosts')?.addEventListener('change', (e) => {
        showGhosts = e.target.checked;
        renderCurrentFloor();
    });
    document.getElementById('map-long-links')?.addEventListener('change', (e) => {
        showLongLinks = e.target.checked;
        renderCurrentFloor();
    });
}

function updateHint(n) {
    const el = document.getElementById('map-hint');
    if (!el) return;
    if (!n) { el.textContent = ''; return; }
    const exits = [];
    for (let d = 0; d <= 5; d++) {
        const door = n.room.doors[d];
        if (door && door.VNumTo > 0) exits.push(dirSimpleName[d] + '\u2192' + door.VNumTo);
    }
    el.textContent = '#' + n.vnum + ' ' + (n.room.name || '') + '   ' + exits.join('  ');
}

export function openMap(area) {
    if (!area || !area.rooms || area.rooms.length === 0) return;
    const panel = document.getElementById('map-panel');
    if (!panel) return;

    graph = buildGraph(area.rooms);
    assignFloors(graph.nodes);
    floors = layout(graph);
    classifyEdges(graph);
    metrics = areaMetrics(floors);

    minFloor = floors.length ? floors[0].z : 0;
    maxFloor = floors.length ? floors[floors.length - 1].z : 0;
    floorIndex = Math.max(0, floors.findIndex(f => f.z === 0));
    hoverVnum = null;
    selectedVnum = null;

    currentAreaName = area.general ? (area.general.areaName || 'area') : 'area';
    const nameEl = document.getElementById('map-area-name');
    if (nameEl) nameEl.textContent = currentAreaName;

    panel.classList.remove('hidden');
    zoomLevel = 1;
    updateFloorUI();
    updateStats();
    renderCurrentFloor();
    zoomFit();
    panel.focus();
}

export function closeMap() {
    const panel = document.getElementById('map-panel');
    if (panel) panel.classList.add('hidden');
    graph = null;
    floors = [];
    metrics = null;
}

export function isMapOpen() {
    const panel = document.getElementById('map-panel');
    return panel && !panel.classList.contains('hidden');
}

function updateFloorUI() {
    const floor = floors[floorIndex];
    const label = document.getElementById('map-floor-label');
    if (label) {
        label.textContent = floor
            ? 'Floor ' + floor.z + ' (' + floor.rooms.length + ')'
            : 'Floor -';
    }
    const up = document.getElementById('map-floor-up');
    const down = document.getElementById('map-floor-down');
    if (up) up.disabled = floorIndex >= floors.length - 1;
    if (down) down.disabled = floorIndex <= 0;
}

function updateStats() {
    if (!graph) return;
    const grid = graph.edges.filter(e => e.kind === 'grid').length;
    const far = graph.edges.filter(e => e.kind === 'far').length;
    const portal = graph.edges.filter(e => e.kind === 'portal').length;
    const sections = floors.reduce((s, f) => s + f.sections.length, 0);
    const el = document.getElementById('map-room-count');
    if (el) el.textContent = graph.nodes.size + ' rooms \u00b7 ' + floors.length + ' floors \u00b7 ' + sections + ' districts';
    const el2 = document.getElementById('map-exit-count');
    if (el2) {
        const tot = grid + far + portal;
        const pct = tot ? Math.round(grid / tot * 100) : 100;
        el2.textContent = (tot + graph.vertical.length) + ' exits \u00b7 ' + pct + '% aligned';
    }
}

export function mapFloorUp() {
    if (floorIndex < floors.length - 1) { floorIndex++; updateFloorUI(); renderCurrentFloor(); }
}

export function mapFloorDown() {
    if (floorIndex > 0) { floorIndex--; updateFloorUI(); renderCurrentFloor(); }
}

function applyZoom(cursorX, cursorY, oldZoom) {
    const canvas = document.getElementById('map-canvas');
    const container = document.getElementById('map-canvas-container');
    if (!canvas || !container) return;
    if (cursorX !== undefined && oldZoom) {
        const s = zoomLevel / oldZoom;
        container.scrollLeft = cursorX * s - (cursorX - container.scrollLeft);
        container.scrollTop = cursorY * s - (cursorY - container.scrollTop);
    }
    canvas.style.transform = 'scale(' + zoomLevel + ')';
    canvas.style.transformOrigin = 'top left';
    const label = document.getElementById('map-zoom-label');
    if (label) label.textContent = Math.round(zoomLevel * 100) + '%';
}

export function zoomIn() { zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP); applyZoom(); }
export function zoomOut() { zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP); applyZoom(); }

export function zoomFit() {
    const container = document.getElementById('map-canvas-container');
    const canvas = document.getElementById('map-canvas');
    if (!container || !canvas) return;
    const pw = parseFloat(canvas.style.width) || canvas.width;
    const ph = parseFloat(canvas.style.height) || canvas.height;
    if (!pw || !ph) return;
    zoomLevel = Math.max(ZOOM_MIN, Math.min(container.clientWidth / pw, container.clientHeight / ph, 1));
    applyZoom();
    container.scrollLeft = 0;
    container.scrollTop = 0;
}

export function exportAllFloorsPNG() {
    if (!graph || !floors.length) return;
    const safe = (currentAreaName || 'area').toLowerCase()
        .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'area';
    // Same frame for every image, so the exported floors can be stacked.
    const m = metrics;
    floors.forEach((floor, idx) => {
        const fit = Math.min(1, MAX_CANVAS_DIM / Math.max(m.width, m.height));
        const c = document.createElement('canvas');
        c.width = Math.round(m.width * fit);
        c.height = Math.round(m.height * fit);
        const ctx = c.getContext('2d');
        ctx.setTransform(fit, 0, 0, fit, 0, 0);
        const savedHover = hoverVnum;
        hoverVnum = null;
        drawFloor(ctx, idx, m);
        hoverVnum = savedHover;
        c.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = safe + '_f' + floor.z + '.png';
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    });
}
