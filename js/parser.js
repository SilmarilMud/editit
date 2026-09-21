// parser.js - .are file parser
// Port of CEditItDoc parsing from EditItDoc.cpp

import {
    createArea, createMobile, createObject, createRoom, createDoor,
    createHelp, createExtraDescr, createApply, createLoadedObject,
    createLoadedMob, createMobObject,
    AREA_NEW_FORMAT, AREA_NEW_RESET, ACT_MASK, AFF_MOB_MASK, AFF_OBJ_MASK,
    ITEM_MASK, ITEM_WEAR_MASK, ROOM_MASK, LOOKUPNOTFOUND, WEAR_NONE,
    DOOR_NOT_RESET, EX_ISDOOR, EX_PICKPROOF, EX_BASHPROOF, EX_PASSPROOF,
    MAX_VNUM, MAX_DIR, SHOPMAXTRADE,
    sexName, guildName, races, itemTypeName, itemWeaponName, itemContainerFlagsName,
    itemLiquidName, itemPoisonName, itemFurnitureFlagsName, itemTrapType,
    itemTrapDamage, applyName, spells, mobSpecFuncs, objSpecFuncs, sectTypeName,
    wearName, doorResetName, itemValues,
    VALUE_IS_UNUSED, VALUE_IS_LIGHT, VALUE_IS_SPELL, VALUE_IS_NUMBER_FROM_0,
    VALUE_IS_WEAPON, VALUE_IS_CONTAINER_FLAGS, VALUE_IS_VNUM, VALUE_IS_LIQUID,
    VALUE_IS_POISON, VALUE_IS_NUMBER, VALUE_IS_FURNITURE_FLAGS,
    VALUE_IS_TRAPTYPE, VALUE_IS_TRAPDAMAGE,
} from './constants.js';
import { getMobByVNum, getObjByVNum, getRoomByVNum, clamp } from './utils.js';

// Lookup helpers
function lookupTable(value, table) {
    for (let i = 0; i < table.length; i++) {
        if (table[i] !== undefined) {
            // Handle both string arrays and object arrays {value, label, desc}
            const entry = typeof table[i] === 'object' ? table[i].value : table[i];
            if (value.toLowerCase() === entry.toLowerCase()) return i;
        }
    }
    return LOOKUPNOTFOUND;
}
function lookupNumber(value, table) {
    for (let i = 0; i < table.length; i++) {
        if (table[i].number === value) return i;
    }
    return LOOKUPNOTFOUND;
}
function lookupEng(name, table) {
    for (let i = 0; i < table.length; i++) {
        if (name.toLowerCase() === table[i].english.toLowerCase()) return i;
    }
    return LOOKUPNOTFOUND;
}
function stripBlankLines(str) { return str.replace(/\n+$/, ''); }
function getObjectTypeValueId(type) {
    for (let i = 0; i < itemValues.length; i++) {
        if (type === itemValues[i].itemType) return i;
    }
    return -1;
}
// Using getMobByVNum from utils.js
// Using getObjByVNum from utils.js
// Using getRoomByVNum from utils.js
function createResetOnlyRoom(vnum) {
    const room = createRoom();
    room.resetOnly = true; room.VNum = vnum;
    room.name = '<<<< SOLO per i RESET >>>>';
    room.descr = ''; room.flags = 0; room.sectorType = 0;
    room.isRandom = false; room.randomLevel = 0;
    for (let i = 0; i <= MAX_DIR; i++) room.doors[i] = createDoor();
    return room;
}

class Parser {
    constructor(text) {
        this.text = text; this.pos = 0; this.length = text.length; this.fileRow = 1;
        this.errors = [];
    }

    addWarning(msg) {
        this.errors.push({ severity: 'warning', message: msg, line: this.fileRow });
    }

    readLetter() {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n') { this.fileRow++; this.pos++; continue; }
            if (c === ' ' || c === '\t' || c === '\r') { this.pos++; continue; }
            this.pos++; return c;
        }
        throw new Error(`ReadLetter: EOF (line ${this.fileRow})`);
    }
    readNumber() {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n') { this.fileRow++; this.pos++; continue; }
            if (c === ' ' || c === '\t' || c === '\r') { this.pos++; continue; }
            break;
        }
        let sign = false, c = this.text[this.pos];
        if (c === '+') { this.pos++; c = this.text[this.pos]; }
        else if (c === '-') { sign = true; this.pos++; c = this.text[this.pos]; }
        if (!c || c < '0' || c > '9') throw new Error(`ReadNumber: Format error (line ${this.fileRow})`);
        let number = 0;
        while (c >= '0' && c <= '9') { number = number * 10 + c.charCodeAt(0) - 48; this.pos++; c = this.text[this.pos]; }
        if (sign) number = -number;
        if (c === '|') { this.pos++; return number + this.readNumber(); }
        return number;
    }
    readString() {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n') { this.fileRow++; this.pos++; continue; }
            if (c === ' ' || c === '\t' || c === '\r') { this.pos++; continue; }
            break;
        }
        let result = '';
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '~') { this.pos++; return result; }
            if (c === '\r') { this.pos++; continue; }
            if (c === '\n') { this.fileRow++; result += c; this.pos++; continue; }
            result += c; this.pos++;
        }
        throw new Error(`ReadString: EOF (line ${this.fileRow})`);
    }
    readToEol() {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n' || c === '\r') { this.pos++; break; }
            this.pos++;
        }
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n' || c === '\r') { if (c === '\n') this.fileRow++; this.pos++; continue; }
            break;
        }
    }
    readWord() {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n') { this.fileRow++; this.pos++; continue; }
            if (c === ' ' || c === '\t' || c === '\r') { this.pos++; continue; }
            break;
        }
        if (this.pos >= this.length) throw new Error(`ReadWord: EOF (line ${this.fileRow})`);
        let cEnd = this.text[this.pos]; this.pos++;
        if (cEnd === "'" || cEnd === '"') {
            let r = '';
            while (this.pos < this.length) {
                const c = this.text[this.pos];
                if (c === cEnd) { this.pos++; return r; }
                if (c === '\n') this.fileRow++;
                r += c; this.pos++;
            }
            return r;
        }
        let r = cEnd;
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === ' ' || c === '\t' || c === '\n' || c === '\r') break;
            r += c; this.pos++;
        }
        return r;
    }
    readOptionalNumber(def) {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\t' || c === ' ' || c === '\r') { this.pos++; continue; }
            break;
        }
        if (this.pos >= this.length) return def;
        const c = this.text[this.pos];
        if (c !== '+' && c !== '-' && (c < '0' || c > '9')) {
            if (c === '\n' || c === '\r') {
                while (this.pos < this.length) {
                    const ch = this.text[this.pos];
                    if (ch === '\n' || ch === '\r') { if (ch === '\n') this.fileRow++; this.pos++; continue; }
                    break;
                }
            }
            return def;
        }
        let sign = false, p = this.pos;
        if (c === '+') p++; else if (c === '-') { sign = true; p++; }
        if (p >= this.length || this.text[p] < '0' || this.text[p] > '9') return def;
        let number = 0; this.pos = p;
        while (this.pos < this.length) {
            const ch = this.text[this.pos];
            if (ch >= '0' && ch <= '9') { number = number * 10 + ch.charCodeAt(0) - 48; this.pos++; } else break;
        }
        if (sign) number = -number;
        if (this.pos < this.length) {
            const ch = this.text[this.pos];
            if (ch === '\n' || ch === '\r') {
                while (this.pos < this.length) {
                    const c2 = this.text[this.pos];
                    if (c2 === '\n' || c2 === '\r') { if (c2 === '\n') this.fileRow++; this.pos++; continue; }
                    break;
                }
            }
        }
        return number;
    }
    readOptionalNumberToEol(def) {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\t' || c === ' ' || c === '\r') { this.pos++; continue; }
            break;
        }
        if (this.pos >= this.length) return def;
        const c = this.text[this.pos];
        if (c !== '+' && c !== '-' && (c < '0' || c > '9')) {
            if (c === '\n' || c === '\r') {
                while (this.pos < this.length) {
                    const ch = this.text[this.pos];
                    if (ch === '\n' || ch === '\r') { if (ch === '\n') this.fileRow++; this.pos++; continue; }
                    break;
                }
            } else this.readToEol();
            return def;
        }
        let sign = false, p = this.pos;
        if (c === '+') p++; else if (c === '-') { sign = true; p++; }
        if (p >= this.length || this.text[p] < '0' || this.text[p] > '9') { this.readToEol(); return def; }
        let number = 0; this.pos = p;
        while (this.pos < this.length) {
            const ch = this.text[this.pos];
            if (ch >= '0' && ch <= '9') { number = number * 10 + ch.charCodeAt(0) - 48; this.pos++; } else break;
        }
        if (sign) number = -number;
        if (this.pos < this.length) {
            const ch = this.text[this.pos];
            if (ch === '\n' || ch === '\r') {
                while (this.pos < this.length) {
                    const c2 = this.text[this.pos];
                    if (c2 === '\n' || c2 === '\r') { if (c2 === '\n') this.fileRow++; this.pos++; continue; }
                    break;
                }
            } else this.readToEol();
        }
        return number;
    }

    // Peek at next non-whitespace char without consuming
    peekChar() {
        let pos = this.pos;
        while (pos < this.length) {
            const c = this.text[pos];
            if (c === '\n' || c === ' ' || c === '\t' || c === '\r') { pos++; continue; }
            return c;
        }
        return null;
    }

    // Skip a value: if next is ~, skip string; if next is digit/sign, skip number
    skipValue() {
        const c = this.peekChar();
        if (c === '~') {
            this.readString();
        } else if (c && ((c >= '0' && c <= '9') || c === '+' || c === '-')) {
            this.readNumber();
        } else {
            // Unknown shape - skip to end of line
            this.readToEol();
        }
    }

    // Skip to the next section boundary (# at start of line, followed by a letter) or EOF
    skipToNextSection() {
        while (this.pos < this.length) {
            const c = this.text[this.pos];
            if (c === '\n') {
                this.fileRow++;
                this.pos++;
                // Check if next line starts with # followed by a letter (section header)
                let peek = this.pos;
                while (peek < this.length && (this.text[peek] === ' ' || this.text[peek] === '\t')) peek++;
                if (peek < this.length && this.text[peek] === '#' &&
                    peek + 1 < this.length && /[A-Za-z]/.test(this.text[peek + 1])) return;
                continue;
            }
            this.pos++;
        }
    }

    // Section parsers
    loadArea(general) {
        for (;;) {
            const word = this.readWord().toLowerCase();
            if (word === 'name') general.areaName = this.readString();
            else if (word === 'author') general.author = this.readString();
            else if (word === 'range') { general.racMinLev = this.readNumber(); general.racMaxLev = this.readNumber(); }
            else if (word === 'flags') general.areaFlags = this.readNumber();
            else if (word === 'music') general.areaMusic = this.readString();
            else if (word === 'plane') general.planeName = this.readString();
            else if (word === 'recall') general.recallVNum = this.readNumber();
            else if (word === 'reset') general.resetMsg = this.readString();

            else if (word === 'end') break;
            else {
                this.addWarning(`LoadArea: Unknown field "${word}" (line ${this.fileRow}), skipping`);
                this.skipValue();
            }
        }

    }
    loadOldArea(general) {
        // Format: #AREA {<min> <max>} <Author> <Name>~
        const str = this.readString();
        const braceIdx = str.indexOf('{');
        if (braceIdx !== -1) {
            const after = str.substring(braceIdx + 1);
            const cb = after.indexOf('}');
            const inner = cb !== -1 ? after.substring(0, cb) : after;
            const parts = inner.trim().split(/\s+/);
            if (parts.length >= 2) {
                general.racMinLev = parseInt(parts[0], 10) || 0;
                general.racMaxLev = parseInt(parts[1], 10) || 50;
            }
            if (general.racMinLev < 1 || general.racMinLev > 50) {
                console.warn(`LoadArea: racMinLev ${general.racMinLev} out of range [1, 50], clamping`);
                general.racMinLev = clamp(general.racMinLev, 1, 50);
            }
            if (general.racMaxLev < 1 || general.racMaxLev > 50) {
                console.warn(`LoadArea: racMaxLev ${general.racMaxLev} out of range [1, 50], clamping`);
                general.racMaxLev = clamp(general.racMaxLev, 1, 50);
            }
        }
        
        // Get content after closing brace
        let afterBrace = '';
        const closeBrace = str.indexOf('}');
        if (closeBrace !== -1) {
            afterBrace = str.substring(closeBrace + 1).trim();
        }
        
        // Parse "Author Name~" - split on first space, ~ is terminator from readString
        if (afterBrace) {
            const spaceIdx = afterBrace.indexOf(' ');
            if (spaceIdx !== -1) {
                general.author = afterBrace.substring(0, spaceIdx).trim();
                general.areaName = afterBrace.substring(spaceIdx + 1).trim();
            } else {
                // No space - could be just name or just author
                general.areaName = afterBrace;
                general.author = '';
            }
        } else {
            general.areaName = '';
            general.author = '';
        }
        
        general.areaFlags = 0;
    }
    loadHelps(helps) {
        for (;;) {
            const level = this.readNumber();
            const keyword = this.readString();
            if (keyword.startsWith('$')) break;
            const help = createHelp();
            help.level = level; help.keywords = keyword; help.text = this.readString();
            helps.push(help);
        }
    }
    loadRecall(general) {
        general.recallVNum = this.readNumber();
    }
    loadMobiles(mobs, general) {
        for (;;) {
            const letter = this.readLetter();
            if (letter !== '#') throw new Error(`LoadMobiles: '#' expected (line ${this.fileRow})`);
            const vnum = this.readNumber();
            if (vnum === 0) break;
            if (vnum <= 0 || vnum >= MAX_VNUM) throw new Error(`LoadMobiles: VNum ${vnum} out of range`);
            if (getMobByVNum(mobs, vnum)) throw new Error(`LoadMobiles: VNum ${vnum} duplicated`);
            if (general.VNumStart === 0 || general.VNumStart > vnum) general.VNumStart = vnum;

            const mob = createMobile();
            mob.VNum = vnum;
            mob.keywords = this.readString();
            mob.shortDescr = this.readString();
            mob.longDescr = stripBlankLines(this.readString());
            mob.descr = stripBlankLines(this.readString());
            mob.actFlags = this.readNumber() & ACT_MASK;
            mob.affFlags = this.readNumber() & AFF_MOB_MASK;
            mob.align = this.readNumber();
            if (mob.align < -1000 || mob.align > 1000) {
                console.warn(`LoadMobiles: VNum ${vnum} Align ${mob.align} out of range [-1000, 1000], clamping`);
                mob.align = clamp(mob.align, -1000, 1000);
            }
            if (this.readLetter() !== 'S') throw new Error(`LoadMobiles: VNum ${vnum} expected 'S'`);
            mob.level = this.readNumber();
            if (mob.level < 0) {
                console.warn(`LoadMobiles: VNum ${vnum} Level ${mob.level} out of range [0, 100], clamping`);
                mob.level = clamp(mob.level, 0, 100);
            }

            if (general.areaFlags & AREA_NEW_FORMAT) {
                mob.reputation = this.readNumber();
                if (mob.reputation < -1000 || mob.reputation > 1000) {
                    console.warn(`LoadMobiles: VNum ${vnum} Reputation ${mob.reputation} out of range [-1000, 1000], clamping`);
                    mob.reputation = clamp(mob.reputation, -1000, 1000);
                }
            } else {
                this.readNumber();
            }

            this.readNumber(); // AC
            this.readNumber(); this.readLetter(); this.readNumber(); this.readLetter(); this.readNumber(); // hit
            this.readNumber(); this.readLetter(); this.readNumber(); this.readLetter(); this.readNumber(); // dam
            mob.gold = this.readNumber();

            if (general.areaFlags & AREA_NEW_FORMAT) {
                mob.guild = this.readNumber();
                if (lookupNumber(mob.guild, guildName) === LOOKUPNOTFOUND) mob.guild = 0;
            } else {
                this.readNumber();
            }

            this.readNumber(); // Position
            mob.race = this.readString();
            const raceIdx = lookupEng(mob.race, races);
            if (raceIdx === LOOKUPNOTFOUND) {
                console.warn(`LoadMobiles: VNum ${vnum} invalid race "${mob.race}", defaulting to first race`);
                mob.race = races[0]?.english || '';
            } else {
                mob.race = races[raceIdx].english;
            }
            mob.sex = this.readNumber() % 3;
            if (lookupNumber(mob.sex, sexName) === LOOKUPNOTFOUND)
                throw new Error(`LoadMobiles: VNum ${vnum} invalid sex (${mob.sex})`);

            mob.special = ''; mob.isShopKeeper = false;
            // Note: buyType, profitBuy, profitSell, openHour, closeHour are initialized
            // by createMobile() and will be overwritten by loadShops() if this mob is a shopkeeper
            mobs.push(mob);
        }
    }
    loadObjects(objs, general) {
        for (;;) {
            const letter = this.readLetter();
            if (letter !== '#') throw new Error(`LoadObjects: '#' expected (line ${this.fileRow})`);
            const vnum = this.readNumber();
            if (vnum === 0) break;
            if (vnum <= 0 || vnum >= MAX_VNUM) throw new Error(`LoadObjects: VNum ${vnum} out of range`);
            if (getObjByVNum(objs, vnum)) throw new Error(`LoadObjects: VNum ${vnum} duplicated`);
            if (general.VNumStart === 0 || general.VNumStart > vnum) general.VNumStart = vnum;

            const obj = createObject();
            obj.VNum = vnum;
            obj.keywords = this.readString();
            obj.shortDescr = this.readString();
            obj.longDescr = this.readString();
            obj.action = this.readString();
            const typeNum = this.readNumber();
            if (lookupNumber(typeNum, itemTypeName) === LOOKUPNOTFOUND)
                throw new Error(`LoadObjects: VNum ${vnum} invalid type (${typeNum})`);
            obj.type = typeNum;
            obj.extraFlags = this.readNumber() & ITEM_MASK;
            obj.wearFlags = this.readNumber() & ITEM_WEAR_MASK;
            const value = [this.readString(), this.readString(), this.readString(), this.readString()];
            obj.weight = this.readNumber();
            obj.cost = this.readNumber();
            this.readNumber(); // CostPerDay
            obj.wearAffs = 0; obj.wearOnMsg = ''; obj.wearOffMsg = '';
            let sectionDRead = false;
            for (;;) {
                const l = this.readLetter();
                if (l === 'A') {
                    const at = this.readNumber();
                    const av = this.readNumber();
                    if (at !== 0 && lookupNumber(at, applyName) === LOOKUPNOTFOUND) {
                        console.warn(`LoadObjects: VNum ${vnum} apply type ${at} not supported, skipping`);
                        continue;
                    }
                    const apply = createApply();
                    apply.type = at; apply.value = av;
                    obj.applyType.push(apply);
                } else if (l === 'E') {
                    const ed = createExtraDescr();
                    ed.keywords = this.readString();
                    ed.descr = stripBlankLines(this.readString());
                    obj.extraDescr.push(ed);
                } else if (l === 'D') {
                    if (sectionDRead) throw new Error(`LoadObjects: VNum ${vnum} duplicate 'D' section`);
                    obj.wearAffs = this.readNumber() & AFF_OBJ_MASK;
                    obj.wearOnMsg = this.readString();
                    obj.wearOffMsg = this.readString();
                    sectionDRead = true;
                } else {
                    this.pos--; if (l === '\n') this.fileRow--;
                    break;
                }
            }

            const id = getObjectTypeValueId(obj.type);
            if (id < 0) throw new Error(`LoadObjects: Config error for type ${obj.type}`);
            for (let i = 0; i < 4; i++) {
                const val = parseInt(value[i]) || 0;
                const t = itemValues[id].type[i];
                switch (t) {
                    case VALUE_IS_UNUSED: obj.value[i] = 0; break;
                    case VALUE_IS_LIGHT: obj.value[i] = val < 0 ? -1 : val; break;
                    case VALUE_IS_SPELL:
                        if (value[i] === '0' || value[i] === '') {
                            obj.value[i] = 0; // no spell
                        } else if (lookupTable(value[i], spells) === LOOKUPNOTFOUND) {
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid spell "${value[i]}"`);
                        } else {
                            obj.value[i] = lookupTable(value[i], spells);
                        }
                        break;
                    case VALUE_IS_NUMBER_FROM_0:
                        if (val < 0) throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} negative`);
                        obj.value[i] = val; break;
                    case VALUE_IS_WEAPON:
                        if (lookupNumber(val, itemWeaponName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid weapon`);
                        obj.value[i] = val; break;
                    case VALUE_IS_CONTAINER_FLAGS:
                        if (lookupNumber(val, itemContainerFlagsName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid container`);
                        obj.value[i] = val; break;
                    case VALUE_IS_VNUM: obj.value[i] = val < 0 ? 0 : val; break;
                    case VALUE_IS_LIQUID:
                        if (lookupNumber(val, itemLiquidName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid liquid`);
                        obj.value[i] = val; break;
                    case VALUE_IS_POISON: {
                        let pv = val < 0 ? -1 : (val > 0 ? 1 : 0);
                        if (lookupNumber(pv, itemPoisonName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid poison`);
                        obj.value[i] = pv; break;
                    }
                    case VALUE_IS_NUMBER: obj.value[i] = val; break;
                    case VALUE_IS_FURNITURE_FLAGS:
                        if (lookupNumber(val, itemFurnitureFlagsName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid furniture`);
                        obj.value[i] = val; break;
                    case VALUE_IS_TRAPTYPE:
                        if (lookupNumber(val, itemTrapType) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid trap type`);
                        obj.value[i] = val; break;
                    case VALUE_IS_TRAPDAMAGE:
                        if (lookupNumber(val, itemTrapDamage) === LOOKUPNOTFOUND)
                            throw new Error(`LoadObjects: VNum ${vnum} val ${i+1} invalid trap damage`);
                        obj.value[i] = val; break;
                    default: throw new Error(`LoadObjects: Config error`);
                }
            }
            objs.push(obj);
        }
    }
    loadRooms(rooms, general) {
        for (;;) {
            const letter = this.readLetter();
            if (letter !== '#') throw new Error(`LoadRooms: '#' expected (line ${this.fileRow})`);
            const vnum = this.readNumber();
            if (vnum === 0) break;
            if (vnum <= 0 || vnum >= MAX_VNUM) throw new Error(`LoadRooms: VNum ${vnum} out of range`);
            if (getRoomByVNum(rooms, vnum)) throw new Error(`LoadRooms: VNum ${vnum} duplicated`);
            if (general.VNumStart === 0 || general.VNumStart > vnum) general.VNumStart = vnum;

            const room = createRoom();
            room.resetOnly = false; room.VNum = vnum;
            room.name = this.readString();
            room.descr = stripBlankLines(this.readString());
            this.readNumber(); // Area Number
            room.flags = this.readNumber() & ROOM_MASK;
            const sect = this.readNumber();
            if (lookupNumber(sect, sectTypeName) === LOOKUPNOTFOUND)
                throw new Error(`LoadRooms: VNum ${vnum} invalid sector type (${sect})`);
            room.sectorType = sect;
            room.isRandom = false; room.randomLevel = 0;
            for (let door = 0; door <= MAX_DIR; door++) room.doors[door] = createDoor();

            for (;;) {
                const l = this.readLetter();
                if (l === 'S' || l === 's') break;
                if (l === 'D') {
                    const door = this.readNumber();
                    if (door < 0 || door > 5) throw new Error(`LoadRooms: VNum ${vnum} invalid exit (${door})`);
                    room.doors[door].descr = stripBlankLines(this.readString());
                    room.doors[door].keywords = this.readString();
                    if (general.areaFlags & AREA_NEW_FORMAT) {
                        const peek = this.readLetter();
                        if (peek === 'B') {
                            room.doors[door].exitFlags = this.readNumber();
                        } else {
                            this.pos--;
                            room.doors[door].exitFlags = this.readNumber();
                        }
                    } else {
                        const peek = this.readLetter();
                        if (peek === 'B') {
                            room.doors[door].exitFlags = this.readNumber();
                        } else {
                            this.pos--;
                            const lt = this.readNumber();
                            if (lt < 0) {
                                room.doors[door].exitFlags = 0;
                            } else {
                                room.doors[door].exitFlags = lt;
                                const lockMap = {
                                    1: EX_ISDOOR, 2: EX_ISDOOR | EX_PICKPROOF,
                                    3: EX_ISDOOR | EX_BASHPROOF,
                                    4: EX_ISDOOR | EX_PICKPROOF | EX_BASHPROOF,
                                    5: EX_ISDOOR | EX_PASSPROOF,
                                    6: EX_ISDOOR | EX_PICKPROOF | EX_PASSPROOF,
                                    7: EX_ISDOOR | EX_BASHPROOF | EX_PASSPROOF,
                                    8: EX_ISDOOR | EX_PICKPROOF | EX_BASHPROOF | EX_PASSPROOF,
                                };
                                if (lockMap[lt] !== undefined) room.doors[door].exitFlags = lockMap[lt];
                            }
                        }
                    }
                    room.doors[door].keyVNum = this.readNumber();
                    const vto = this.readNumber();
                    room.doors[door].VNumTo = vto < 0 ? -1 : vto;
                } else if (l === 'E') {
                    const ed = createExtraDescr();
                    ed.keywords = this.readString();
                    ed.descr = stripBlankLines(this.readString());
                    room.extraDescr.push(ed);
                } else {
                    this.addWarning(`LoadRooms: VNum ${vnum} unknown command '${l}' (line ${this.fileRow}), skipping`);
                    this.readToEol();
                }
            }
            rooms.push(room);
        }
    }
    loadOldResets(rooms, mobs, objs, general) {
        const loadedObjs = [];
        let room = null, mob = null, uniqueId = 0;
        for (;;) {
            const letter = this.readLetter();
            if (letter === 'S') break;
            if (letter === '*') { this.readToEol(); continue; }
            this.readNumber(); // flags (always 0, stored but ignored)
            const arg1 = this.readNumber();
            const arg2 = this.readNumber();
            let arg3, arg4;
            if (letter === 'G') {
                arg3 = this.readOptionalNumberToEol(0);
            } else {
                arg3 = (letter === 'R' ? 0 : this.readNumber());
                if (letter === 'O' || letter === 'P') arg4 = this.readOptionalNumberToEol(1);
                else this.readToEol();
            }
            switch (letter) {
                case 'M': {
                    if (arg1 < 1) throw new Error(`LoadResets: 'M' invalid mob vnum`);
                    if (arg2 < 1) throw new Error(`LoadResets: 'M' mob ${arg1} invalid limit`);
                    let rm = getRoomByVNum(rooms, arg3);
                    if (!rm) { rm = createResetOnlyRoom(arg3); rooms.push(rm); }
                    const lm = createLoadedMob();
                    lm.VNum = arg1; lm.limit = arg2; lm.awake = 0; lm.sleep = 23;
                    lm.UniqueId = uniqueId++; rm.mobs.push(lm); mob = lm;
                    break;
                }
                case 'O': {
                    if (arg1 < 1) throw new Error(`LoadResets: 'O' invalid obj vnum`);
                    let rm = getRoomByVNum(rooms, arg3);
                    if (!rm) { rm = createResetOnlyRoom(arg3); rooms.push(rm); }
                    const lo = createLoadedObject();
                    lo.VNum = arg1; lo.level = arg2; lo.limit = arg4 !== undefined ? arg4 : 1;
                    lo.UniqueId = uniqueId++; rm.objs.push(lo); loadedObjs.push(lo);
                    break;
                }
                case 'P': {
                    if (arg1 < 1) throw new Error(`LoadResets: 'P' invalid obj vnum`);
                    let idx = -1;
                    for (let i = loadedObjs.length - 1; i >= 0; i--) {
                        if (loadedObjs[i].VNum === arg3) { idx = i; break; }
                    }
                    if (idx < 0) {
                        console.warn(`LoadResets: 'P' container ${arg3} not loaded, skipping`);
                        break;
                    }
                    const lo = createLoadedObject();
                    lo.VNum = arg1; lo.level = arg2; lo.limit = arg4 !== undefined ? arg4 : 1;
                    lo.UniqueId = uniqueId++;
                    loadedObjs[idx].contain.push(lo); loadedObjs.push(lo);
                    break;
                }
                case 'G': case 'E': {
                    if (arg1 < 1) throw new Error(`LoadResets: '${letter}' invalid obj vnum`);
                    if (!mob) throw new Error(`LoadResets: '${letter}' no mob loaded`);
                    const mo = createMobObject(); mo.VNum = arg1;
                    if (letter === 'G') { mo.level = arg3; mo.wearLoc = WEAR_NONE; mo.storage = 0; }
                    else { mo.level = 0;
                        if (lookupNumber(arg3, wearName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadResets: '${letter}' invalid wear loc (${arg3})`);
                        mo.wearLoc = arg3;
                    }
                    mo.UniqueId = uniqueId++; mob.contain.push(mo); loadedObjs.push(mo);
                    break;
                }
                case 'D': {
                    let rm = getRoomByVNum(rooms, arg1);
                    if (!rm) { rm = createResetOnlyRoom(arg1); rooms.push(rm); }
                    if (arg2 < 0 || arg2 > 5) throw new Error(`LoadResets: 'D' invalid door`);
                    if (rm.doors[arg2].VNumTo === -1) {
                        console.warn(`LoadResets: 'D' room ${arg1} exit ${arg2} undefined, skipping`);
                        break;
                    }
                    if (lookupNumber(arg3, doorResetName) === LOOKUPNOTFOUND)
                        throw new Error(`LoadResets: 'D' invalid reset type`);
                    rm.doors[arg2].resetType = arg3;
                    break;
                }
                case 'R': {
                    let rm = getRoomByVNum(rooms, arg1);
                    if (!rm) { rm = createResetOnlyRoom(arg1); rooms.push(rm); }
                    if (arg2 < 0 || arg2 > 6) throw new Error(`LoadResets: 'R' invalid door`);
                    rm.isRandom = true; rm.randomLevel = arg2;
                    break;
                }
                default: throw new Error(`LoadResets: Invalid command '${letter}' (line ${this.fileRow})`);
            }
        }
    }
    loadNewResets(rooms, mobs, objs, general) {
        const loadedObjs = [];
        let room = null, mob = null, uniqueId = 0;
        for (;;) {
            const letter = this.readLetter();
            if (letter === 'S') break;
            if (letter === '*') { this.readToEol(); continue; }
            this.readNumber(); // if_flag (ignored in editor)
            let arg1, arg2, arg3, arg4, arg5;
            switch (letter) {
                case 'M':
                    arg1 = this.readNumber(); arg2 = this.readNumber(); arg3 = this.readNumber();
                    arg4 = this.readOptionalNumber(0); arg5 = this.readOptionalNumberToEol(23);
                    break;
                case 'O': case 'P':
                    arg1 = this.readNumber(); arg2 = this.readNumber(); arg3 = this.readNumber();
                    arg4 = this.readOptionalNumberToEol(1);
                    break;
                case 'G':
                    arg1 = this.readNumber(); arg2 = this.readNumber();
                    arg3 = this.readOptionalNumberToEol(0);
                    break;
                case 'E': case 'R':
                    arg1 = this.readNumber(); arg2 = this.readNumber(); this.readToEol();
                    break;
                case 'D':
                    arg1 = this.readNumber(); arg2 = this.readNumber(); arg3 = this.readNumber();
                    this.readToEol();
                    break;
                default: throw new Error(`LoadResets: Invalid command '${letter}' (line ${this.fileRow})`);
            }
            switch (letter) {
                case 'M': {
                    if (arg1 < 1) throw new Error(`LoadResets: 'M' invalid mob vnum`);
                    if (arg2 < 1) throw new Error(`LoadResets: 'M' mob ${arg1} invalid limit`);
                    let rm = getRoomByVNum(rooms, arg3);
                    if (!rm) { rm = createResetOnlyRoom(arg3); rooms.push(rm); }
                    const lm = createLoadedMob();
                    lm.VNum = arg1; lm.limit = arg2; lm.awake = arg4; lm.sleep = arg5;
                    lm.UniqueId = uniqueId++; rm.mobs.push(lm); mob = lm;
                    break;
                }
                case 'O': {
                    if (arg1 < 1) throw new Error(`LoadResets: 'O' invalid obj vnum`);
                    let rm = getRoomByVNum(rooms, arg3);
                    if (!rm) { rm = createResetOnlyRoom(arg3); rooms.push(rm); }
                    const lo = createLoadedObject();
                    lo.VNum = arg1; lo.level = arg2; lo.limit = arg4;
                    lo.UniqueId = uniqueId++; rm.objs.push(lo); loadedObjs.push(lo);
                    break;
                }
                case 'P': {
                    if (arg1 < 1) throw new Error(`LoadResets: 'P' invalid obj vnum`);
                    let idx = -1;
                    for (let i = loadedObjs.length - 1; i >= 0; i--) {
                        if (loadedObjs[i].VNum === arg3) { idx = i; break; }
                    }
                    if (idx < 0) {
                        console.warn(`LoadResets: 'P' container ${arg3} not loaded, skipping`);
                        break;
                    }
                    const lo = createLoadedObject();
                    lo.VNum = arg1; lo.level = arg2; lo.limit = arg4;
                    lo.UniqueId = uniqueId++;
                    loadedObjs[idx].contain.push(lo); loadedObjs.push(lo);
                    break;
                }
                case 'G': case 'E': {
                    if (arg1 < 1) throw new Error(`LoadResets: '${letter}' invalid obj vnum`);
                    if (!mob) throw new Error(`LoadResets: '${letter}' no mob loaded`);
                    const mo = createMobObject(); mo.VNum = arg1;
                    if (letter === 'G') { mo.level = arg2; mo.wearLoc = WEAR_NONE; mo.storage = arg3; }
                    else {
                        mo.level = 0;
                        if (lookupNumber(arg2, wearName) === LOOKUPNOTFOUND)
                            throw new Error(`LoadResets: '${letter}' invalid wear loc (${arg2})`);
                        mo.wearLoc = arg2;
                    }
                    mo.UniqueId = uniqueId++; mob.contain.push(mo); loadedObjs.push(mo);
                    break;
                }
                case 'D': {
                    let rm = getRoomByVNum(rooms, arg1);
                    if (!rm) { rm = createResetOnlyRoom(arg1); rooms.push(rm); }
                    if (arg2 < 0 || arg2 > 5) throw new Error(`LoadResets: 'D' invalid door`);
                    if (rm.doors[arg2].VNumTo === -1) {
                        console.warn(`LoadResets: 'D' room ${arg1} exit ${arg2} undefined, skipping`);
                        break;
                    }
                    if (lookupNumber(arg3, doorResetName) === LOOKUPNOTFOUND)
                        throw new Error(`LoadResets: 'D' invalid reset type`);
                    rm.doors[arg2].resetType = arg3;
                    break;
                }
                case 'R': {
                    let rm = getRoomByVNum(rooms, arg1);
                    if (!rm) { rm = createResetOnlyRoom(arg1); rooms.push(rm); }
                    if (arg2 < 0 || arg2 > 6) throw new Error(`LoadResets: 'R' invalid door`);
                    rm.isRandom = true; rm.randomLevel = arg2;
                    break;
                }
            }
        }
    }
    loadResets(rooms, mobs, objs, general) {
        if (!(general.areaFlags & AREA_NEW_RESET)) {
            this.loadOldResets(rooms, mobs, objs, general);
            return;
        }
        this.loadNewResets(rooms, mobs, objs, general);
    }
    loadShops(mobs) {
        for (;;) {
            const keeper = this.readNumber();
            if (keeper === 0) break;
            const mob = getMobByVNum(mobs, keeper);
            if (!mob) throw new Error(`LoadShops: VNum ${keeper} invalid`);
            mob.isShopKeeper = true;
            for (let i = 0; i < SHOPMAXTRADE; i++) mob.buyType[i] = this.readNumber();
            mob.profitBuy = this.readNumber();
            mob.profitSell = this.readNumber();
            mob.openHour = this.readNumber();
            mob.closeHour = this.readNumber();
            this.readToEol();
        }
    }
    loadSpecials(mobs, objs) {
        for (;;) {
            const letter = this.readLetter();
            switch (letter) {
                case 'S': return;
                case '*': break;
                case 'M': {
                    const vnum = this.readNumber();
                    const mob = getMobByVNum(mobs, vnum);
                    if (!mob) throw new Error(`LoadSpecials: Mob ${vnum} not defined`);
                    mob.special = this.readWord();
                    if (lookupTable(mob.special, mobSpecFuncs) === LOOKUPNOTFOUND)
                        console.warn(`LoadSpecials: Mob ${vnum} special "${mob.special}" not in known list`);
                    break;
                }
                case 'O': {
                    const vnum = this.readNumber();
                    const obj = getObjByVNum(objs, vnum);
                    if (!obj) throw new Error(`LoadSpecials: Obj ${vnum} not defined`);
                    obj.special = this.readWord();
                    if (lookupTable(obj.special, objSpecFuncs) === LOOKUPNOTFOUND)
                        console.warn(`LoadSpecials: Obj ${vnum} special "${obj.special}" not in known list`);
                    break;
                }
                default: throw new Error(`LoadSpecials: Invalid command '${letter}' (line ${this.fileRow})`);
            }
            this.readToEol();
        }
    }
}

// ============================================================================
// Main entry point
// ============================================================================

/**
 * Parse an .are file text into structured data.
 * @param {string} text - The full text content of the .are file
 * @returns {Object} Parsed area data with properties: general, helps, mobs, objs, rooms
 */
export function parseFile(text) {
    const parser = new Parser(text);
    const data = {
        general: createArea(),
        helps: [],
        mobs: [],
        objs: [],
        rooms: [],
    };
    data.general.VNumStart = 0; // Will be set to lowest entity VNum during parsing

    for (;;) {
        if (parser.pos >= parser.length) break;
        const c = parser.readLetter();
        if (c !== '#') {
            const lines = parser.text.split('\n');
            const lineContent = lines[parser.fileRow - 1] || '(unknown)';
            throw new Error(`'#' not found (line ${parser.fileRow}): ${lineContent}`);
        }
        const word = parser.readWord();
        const wl = word.toLowerCase();
        if (word === '$') break;
        else if (wl === 'area') parser.loadOldArea(data.general);
        else if (wl === 'newarea') parser.loadArea(data.general);
        else if (wl === 'helps') parser.loadHelps(data.helps);
        else if (wl === 'recall') parser.loadRecall(data.general);
        else if (wl === 'mobiles') parser.loadMobiles(data.mobs, data.general);
        else if (wl === 'objects') parser.loadObjects(data.objs, data.general);
        else if (wl === 'rooms') parser.loadRooms(data.rooms, data.general);
        else if (wl === 'resets') parser.loadResets(data.rooms, data.mobs, data.objs, data.general);
        else if (wl === 'shops') parser.loadShops(data.mobs);
        else if (wl === 'specials') parser.loadSpecials(data.mobs, data.objs);
        else {
            parser.addWarning(`Unknown section "${word}" (line ${parser.fileRow}), skipping`);
            parser.skipToNextSection();
        }
    }

    // If no entities found, default VNumStart to 1
    if (data.general.VNumStart === 0) data.general.VNumStart = 1;

    return { data, errors: parser.errors };
}
