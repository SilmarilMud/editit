// map.js - Area Map Viewer
// Renders a 2D graph of rooms on a canvas, with floor support

import { dirSimpleName, sectTypeName, EX_WINDOW } from './constants.js';

const NODE_W = 160;
const NODE_H = 56;
const GRID_SPACING_X = 220;
const GRID_SPACING_Y = 120;
const PADDING = 60;

const DIR_N = 0, DIR_E = 1, DIR_S = 2, DIR_W = 3, DIR_U = 4, DIR_D = 5;

const DIR_DELTA = {
    [DIR_N]: { dx: 0, dy: -1 },
    [DIR_E]: { dx: 1, dy: 0 },
    [DIR_S]: { dx: 0, dy: 1 },
    [DIR_W]: { dx: -1, dy: 0 },
};

const OPPOSITE = [DIR_S, DIR_W, DIR_N, DIR_E, DIR_D, DIR_U];

const ARROW_COLORS = {
    bidirectional: '#4caf50',
    unidirectional: '#ff9800',
};

const SECTOR_FILL = {
    0: '#e8f5e9', 1: '#e3f2fd', 2: '#f1f8e9', 3: '#c8e6c9',
    4: '#d7ccc8', 5: '#bcaaa4', 6: '#bbdefb', 7: '#90caf9',
    8: '#c5cae9', 9: '#e1f5fe', 10: '#fff9c4', 11: '#90caf9',
    12: '#a5d6a7', 13: '#d7ccc8',
};

const SECTOR_BORDER = {
    0: '#388e3c', 1: '#1565c0', 2: '#558b2f', 3: '#2e7d32',
    4: '#795548', 5: '#5d4037', 6: '#1976d2', 7: '#1565c0',
    8: '#283593', 9: '#0288d1', 10: '#f9a825', 11: '#1565c0',
    12: '#388e3c', 13: '#795548',
};

let currentFloor = 0;
let minFloor = 0;
let maxFloor = 0;
let graph = null;
let zoomLevel = 1.0;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.15;

function buildGraph(rooms) {
    const nodeMap = new Map();
    const edges = [];

    for (const room of rooms) {
        if (room.resetOnly) continue;
        nodeMap.set(room.VNum, {
            vnum: room.VNum,
            room,
            floor: 0,
            gridX: 0,
            gridY: 0,
            placed: false,
        });
    }

    const sortedVnums = [...nodeMap.keys()].sort((a, b) => a - b);
    if (sortedVnums.length === 0) return { nodeMap, edges };

    const startVnum = sortedVnums[0];
    const visited = new Set();
    const queue = [startVnum];
    visited.add(startVnum);
    nodeMap.get(startVnum).floor = 0;

    while (queue.length > 0) {
        const vnum = queue.shift();
        const node = nodeMap.get(vnum);
        const room = node.room;

        for (let d = 0; d <= 5; d++) {
            const door = room.doors[d];
            if (door.VNumTo === -1) continue;
            // Skip window exits - they are look-only, not walkable passages
            if (door.exitFlags & EX_WINDOW) continue;
            const destNode = nodeMap.get(door.VNumTo);
            if (!destNode) continue;

            if (d === DIR_U) destNode.floor = node.floor + 1;
            else if (d === DIR_D) destNode.floor = node.floor - 1;
            else destNode.floor = node.floor; // N/E/S/W inherit parent floor

            if (!visited.has(door.VNumTo)) {
                visited.add(door.VNumTo);
                queue.push(door.VNumTo);
            }

            if (d <= DIR_W) {
                const reverseDoor = destNode.room.doors[OPPOSITE[d]];
                const bidir = reverseDoor && reverseDoor.VNumTo === vnum;
                const exists = edges.some(e =>
                    (e.fromVnum === vnum && e.toVnum === door.VNumTo) ||
                    (e.fromVnum === door.VNumTo && e.toVnum === vnum)
                );
                if (!exists) {
                    edges.push({ fromVnum: vnum, toVnum: door.VNumTo, dir: d, bidirectional: bidir });
                }
            }
        }
    }

    for (const [, node] of nodeMap) {
        if (!visited.has(node.vnum)) node.floor = 0;
    }

    return { nodeMap, edges };
}

function layoutGrid(g) {
    const { nodeMap } = g;
    const floorNodes = new Map();

    for (const [, node] of nodeMap) {
        const f = node.floor;
        if (!floorNodes.has(f)) floorNodes.set(f, []);
        floorNodes.get(f).push(node);
    }

    for (const [, nodes] of floorNodes) {
        nodes.sort((a, b) => a.vnum - b.vnum);
        for (const n of nodes) { n.placed = false; n.gridX = 0; n.gridY = 0; }

        const start = nodes[0];
        start.placed = true;
        const q = [start];

        while (q.length > 0) {
            const node = q.shift();
            const room = node.room;
            for (let d = DIR_N; d <= DIR_W; d++) {
                const door = room.doors[d];
                if (door.VNumTo === -1) continue;
                const dest = nodeMap.get(door.VNumTo);
                if (!dest || dest.floor !== node.floor || dest.placed) continue;
                const delta = DIR_DELTA[d];
                if (!delta) continue;
                dest.gridX = node.gridX + delta.dx;
                dest.gridY = node.gridY + delta.dy;
                dest.placed = true;
                q.push(dest);
            }
        }

        // Place disconnected rooms in a compact 2D grid
        const DISCONNECTED_COLS = 10;
        let extraIdx = 0;
        // Find a safe Y offset below all placed rooms on this floor
        let maxYPlaced = 0;
        for (const n of nodes) {
            if (n.placed && n.gridY > maxYPlaced) maxYPlaced = n.gridY;
        }
        const disconnectBaseY = maxYPlaced + 2;
        for (const n of nodes) {
            if (!n.placed) {
                n.gridX = (extraIdx % DISCONNECTED_COLS) * 2;
                n.gridY = disconnectBaseY + Math.floor(extraIdx / DISCONNECTED_COLS) * 2;
                n.placed = true;
                extraIdx++;
            }
        }
    }
}

function getFloorBounds(floor) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let count = 0;
    for (const [, node] of graph.nodeMap) {
        if (node.floor !== floor) continue;
        count++;
        if (node.gridX < minX) minX = node.gridX;
        if (node.gridY < minY) minY = node.gridY;
        if (node.gridX > maxX) maxX = node.gridX;
        if (node.gridY > maxY) maxY = node.gridY;
    }
    console.log('[Map] getFloorBounds:', { floor, count, minX, minY, maxX, maxY });
    return count === 0 ? null : { minX, minY, maxX, maxY };
}

function renderFloor(canvas, floor) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const bounds = getFloorBounds(floor);

    if (!bounds) {
        canvas.style.width = '400px';
        canvas.style.height = '100px';
        canvas.width = 400;
        canvas.height = 100;
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, 400, 100);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No rooms on this floor', 200, 50);
        return;
    }

    const { minX, minY, maxX, maxY } = bounds;
    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;
    const logicalW = cols * GRID_SPACING_X + PADDING * 2;
    const logicalH = rows * GRID_SPACING_Y + PADDING * 2;

    console.log('[Map] floor:', floor, 'bounds:', bounds, 'cols:', cols, 'rows:', rows, 'logicalW:', logicalW, 'logicalH:', logicalH, 'dpr:', dpr);

    // Safeguard: limit canvas size to prevent browser issues
    const MAX_CANVAS_DIM = 8000;
    const finalLogicalW = Math.min(logicalW, MAX_CANVAS_DIM);
    const finalLogicalH = Math.min(logicalH, MAX_CANVAS_DIM);

    canvas.width = Math.round(finalLogicalW * dpr);
    canvas.height = Math.round(finalLogicalH * dpr);
    canvas.style.width = finalLogicalW + 'px';
    canvas.style.height = finalLogicalH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, logicalW, logicalH);

    const ox = PADDING - minX * GRID_SPACING_X;
    const oy = PADDING - minY * GRID_SPACING_Y;

    function toPixel(gx, gy) {
        return {
            x: ox + gx * GRID_SPACING_X + GRID_SPACING_X / 2,
            y: oy + gy * GRID_SPACING_Y + GRID_SPACING_Y / 2,
        };
    }

    for (const edge of graph.edges) {
        const fromNode = graph.nodeMap.get(edge.fromVnum);
        const toNode = graph.nodeMap.get(edge.toVnum);
        if (!fromNode || !toNode) continue;
        if (fromNode.floor !== floor || toNode.floor !== floor) continue;
        drawArrow(ctx, toPixel(fromNode.gridX, fromNode.gridY), toPixel(toNode.gridX, toNode.gridY), edge);
    }

    for (const [, node] of graph.nodeMap) {
        if (node.floor !== floor) continue;
        drawRoomNode(ctx, node, toPixel(node.gridX, node.gridY));
    }
}

function drawArrow(ctx, from, to, edge) {
    let sx, sy, ex, ey;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
        sx = from.x + Math.sign(dx) * (NODE_W / 2 + 4);
        sy = from.y;
        ex = to.x - Math.sign(dx) * (NODE_W / 2 + 4);
        ey = to.y;
    } else {
        sx = from.x;
        sy = from.y + Math.sign(dy) * (NODE_H / 2 + 4);
        ex = to.x;
        ey = to.y - Math.sign(dy) * (NODE_H / 2 + 4);
    }

    const adx = ex - sx, ady = ey - sy;
    const alen = Math.sqrt(adx * adx + ady * ady);
    if (alen < 2) return;

    const aux = adx / alen, auy = ady / alen;
    const color = edge.bidirectional ? ARROW_COLORS.bidirectional : ARROW_COLORS.unidirectional;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const headLen = 10, headW = 5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - aux * headLen + auy * headW, ey - auy * headLen - aux * headW);
    ctx.lineTo(ex - aux * headLen - auy * headW, ey - auy * headLen + aux * headW);
    ctx.closePath();
    ctx.fill();

    if (edge.bidirectional) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + aux * headLen + auy * headW, sy + auy * headLen - aux * headW);
        ctx.lineTo(sx + aux * headLen - auy * headW, sy + auy * headLen + aux * headW);
        ctx.closePath();
        ctx.fill();
    }

    const midX = (sx + ex) / 2, midY = (sy + ey) / 2;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dirSimpleName[edge.dir] || '', midX - auy * 10, midY + aux * 10);
}

function drawRoomNode(ctx, node, pos) {
    const x = pos.x - NODE_W / 2;
    const y = pos.y - NODE_H / 2;
    const room = node.room;
    const sector = room.sectorType || 0;

    ctx.fillStyle = SECTOR_FILL[sector] || '#f5f5f5';
    ctx.strokeStyle = SECTOR_BORDER[sector] || '#999';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, NODE_W, NODE_H, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('#' + room.VNum, x + 8, y + 6);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#222';
    const maxW = NODE_W - 40;
    let name = room.name || '';
    if (ctx.measureText(name).width > maxW) {
        while (name.length > 0 && ctx.measureText(name + '\u2026').width > maxW) name = name.slice(0, -1);
        name += '\u2026';
    }
    ctx.fillText(name, x + 8, y + 22);

    let iconX = x + NODE_W - 8;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    const hasUp = room.doors[DIR_U] && room.doors[DIR_U].VNumTo !== -1;
    const hasDown = room.doors[DIR_D] && room.doors[DIR_D].VNumTo !== -1;
    if (hasDown) { ctx.fillStyle = '#9c27b0'; ctx.fillText('\u2B07', iconX, y + 6); iconX -= 16; }
    if (hasUp) { ctx.fillStyle = '#2196f3'; ctx.fillText('\u2B06', iconX, y + 6); }

    const sect = (sectTypeName[sector] || {}).name || '';
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(sect, x + 8, y + NODE_H - 4);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

export function initMap() {
    const container = document.getElementById('map-canvas-container');
    if (!container) return;

    // Pinch-to-zoom (macOS trackpad / touch devices)
    container.addEventListener('wheel', (e) => {
        if (!isMapOpen() || !e.ctrlKey) return;
        e.preventDefault();
        const delta = -e.deltaY * 0.01;
        zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel + delta));
        applyZoom();
    }, { passive: false });
}

export function openMap(area) {
    if (!area || !area.rooms || area.rooms.length === 0) return;

    const panel = document.getElementById('map-panel');
    if (!panel) return;

    console.log('[Map] Opening map with', area.rooms.length, 'rooms');
    graph = buildGraph(area.rooms);
    console.log('[Map] Graph built:', graph.nodeMap.size, 'nodes,', graph.edges.length, 'edges');
    layoutGrid(graph);

    // Log node positions
    for (const [vnum, node] of graph.nodeMap) {
        console.log('[Map] Node', vnum, 'floor:', node.floor, 'grid:', node.gridX, node.gridY);
    }

    minFloor = Infinity;
    maxFloor = -Infinity;
    for (const [, node] of graph.nodeMap) {
        if (node.floor < minFloor) minFloor = node.floor;
        if (node.floor > maxFloor) maxFloor = node.floor;
    }
    if (minFloor === Infinity) { minFloor = 0; maxFloor = 0; }

    console.log('[Map] Floor range:', minFloor, 'to', maxFloor);
    currentFloor = 0;

    document.getElementById('map-area-name').textContent = area.general ? area.general.areaName || '' : '';
    updateFloorUI();
    updateStats();

    panel.classList.remove('hidden');
    zoomLevel = 1.0;
    renderCurrentFloor();
    applyZoom();
    panel.focus();
}

export function closeMap() {
    const panel = document.getElementById('map-panel');
    if (panel) panel.classList.add('hidden');
    graph = null;
}

export function isMapOpen() {
    const panel = document.getElementById('map-panel');
    return panel && !panel.classList.contains('hidden');
}

function updateFloorUI() {
    const label = document.getElementById('map-floor-label');
    const upBtn = document.getElementById('map-floor-up');
    const downBtn = document.getElementById('map-floor-down');
    if (label) label.textContent = 'Floor ' + currentFloor;
    if (upBtn) upBtn.disabled = currentFloor >= maxFloor;
    if (downBtn) downBtn.disabled = currentFloor <= minFloor;
}

function updateStats() {
    if (!graph) return;
    const roomCount = graph.nodeMap.size;
    const exitCount = graph.edges.length;
    const el = document.getElementById('map-room-count');
    if (el) el.textContent = roomCount + ' rooms';
    const el2 = document.getElementById('map-exit-count');
    if (el2) el2.textContent = exitCount + ' exits';
}

function renderCurrentFloor() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas || !graph) return;
    renderFloor(canvas, currentFloor);
}

export function mapFloorUp() {
    if (currentFloor < maxFloor) {
        currentFloor++;
        updateFloorUI();
        renderCurrentFloor();
    }
}

export function mapFloorDown() {
    if (currentFloor > minFloor) {
        currentFloor--;
        updateFloorUI();
        renderCurrentFloor();
    }
}

function applyZoom() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    canvas.style.transform = 'scale(' + zoomLevel + ')';
    canvas.style.transformOrigin = 'top left';
    const label = document.getElementById('map-zoom-label');
    if (label) label.textContent = Math.round(zoomLevel * 100) + '%';
}

export function zoomIn() {
    zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    applyZoom();
}

export function zoomOut() {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    applyZoom();
}

export function zoomFit() {
    const container = document.getElementById('map-canvas-container');
    const canvas = document.getElementById('map-canvas');
    if (!container || !canvas) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const pw = parseFloat(canvas.style.width) || canvas.width;
    const ph = parseFloat(canvas.style.height) || canvas.height;
    zoomLevel = Math.min(cw / pw, ch / ph, 1.0);
    applyZoom();
}
