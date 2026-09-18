// writer.js - Area file serializer
// Source: EditItDoc.cpp - Save* functions

const DEBUG = false;

import {
    AREA_NEWFORMAT,
    AREA_NEWRESET,
    ITEM_WARSOUND,
    ITEM_INSTRUMENT,
    ITEM_STAFF,
    ITEM_WAND,
    ITEM_TRAP,
    VALUE_IS_UNUSED,
    VALUE_IS_LIGHT,
    VALUE_IS_NUMBER,
    VALUE_IS_SPELL,
    VALUE_IS_NUMBER_FROM_0,
    VALUE_IS_WEAPON,
    VALUE_IS_CONTAINER_FLAGS,
    VALUE_IS_LIQUID,
    VALUE_IS_POISON,
    VALUE_IS_VNUM,
    VALUE_IS_FURNITURE_FLAGS,
    VALUE_IS_TRAPTYPE,
    VALUE_IS_TRAPDAMAGE,
    WEAR_NONE,
    spells,
    itemValues,
} from './constants.js';

// ============================================================================
// Helper Functions
// ============================================================================

export function transToBits(value) {
    const parts = [];
    let bit = 1;
    while (bit !== 0) {
        if (value & bit) parts.push(bit);
        bit = (bit << 1) >>> 0;
    }
    if (parts.length === 0) return '0';
    const str = parts.join('|');
    return str.length > 30 ? String(value) : str;
}

export function alignToDescr(align) {
    if (align > 900) return 'angelico';
    if (align > 700) return 'santo';
    if (align > 350) return 'buono';
    if (align > 100) return 'gentile';
    if (align > -100) return 'neutrale';
    if (align > -350) return 'cattivo';
    if (align > -700) return 'malvagio';
    if (align > -900) return 'demoniaco';
    return 'satanico';
}

export function repToDescr(reputation) {
    if (reputation > 950) return 'un Eroe';
    if (reputation > 750) return 'un difensore della giustizia';
    if (reputation > 600) return "un garante dell'ordine";
    if (reputation > 450) return "un modello di virtu'";
    if (reputation > 350) return 'un benefattore';
    if (reputation > 200) return 'un gentiluomo';
    if (reputation > 100) return 'una brava persona';
    if (reputation > -100) return 'una persona comune';
    if (reputation > -200) return 'un poco di buono';
    if (reputation > -350) return 'un delinquente';
    if (reputation > -450) return 'un piccolo criminale';
    if (reputation > -600) return 'un tagliagole';
    if (reputation > -750) return 'un criminale';
    if (reputation > -950) return 'un rinnegato';
    return 'un Nemico pubblico';
}

export function objTypeUsesAction(type) {
    return type === ITEM_WARSOUND
        || type === ITEM_INSTRUMENT
        || type === ITEM_STAFF
        || type === ITEM_WAND
        || type === ITEM_TRAP;
}

// ============================================================================
// Writer Class
// ============================================================================

class Writer {
    constructor(area) {
        this.area = area;
    }

    getObjData(vnum) {
        return this.area.objs.find(o => o.VNum === vnum) || null;
    }

    getMobData(vnum) {
        return this.area.mobs.find(m => m.VNum === vnum) || null;
    }

    serialize() {
        let out = '';
        out += this.saveArea();
        out += this.saveHelps();
        out += this.saveRecall();
        out += this.saveMobiles();
        out += this.saveObjects();
        out += this.saveRooms();
        out += this.saveResets();
        out += this.saveShops();
        out += this.saveSpecials();
        out += '#$\n\n';
        
        if (DEBUG) console.log('serialize: Area rooms count:', this.area.rooms.length);
        if (DEBUG) console.log('serialize: Output length:', out.length);
        
        return out;
    }

    saveArea() {
        const g = this.area.general;
        let out = '';
        if (g.areaFlags & AREA_NEWFORMAT) {
            out += '#NEWAREA\n';
            out += 'Name\t' + g.areaName + '~\n';
            out += 'Author\t' + g.author + '~\n';
            out += 'Range\t' + g.racMinLev + ' ' + g.racMaxLev + '\n';
            out += 'Flags\t' + transToBits(g.areaFlags) + '\n';
            out += 'Music\t' + g.areaMusic + '~\n';
            out += 'Recall\t' + ((g.recallVNum >= 0) ? g.recallVNum : 0) + '\n';
            out += 'Reset\t' + g.resetMsg + '~\n';
            out += 'Plane\t' + g.planeName + '~\n';

            out += 'End\n\n';
        } else {
            const authorPart = g.author ? g.author + ' ' : '';
            out += '#AREA {' + String(g.racMinLev).padStart(2, ' ') + ' '
                     + String(g.racMaxLev).padStart(2, ' ') + '} '
                     + authorPart
                     + g.areaName + '~\n\n';
        }
        return out;
    }

    saveHelps() {
        const helps = this.area.helps;
        if (!helps || helps.length === 0) return '';
        let out = '#HELPS\n\n';
        for (const h of helps) {
            out += h.level + ' ' + h.keywords + '~\n';
            out += h.text + '~\n\n';
        }
        out += '0 $~\n\n';
        return out;
    }

    saveRecall() {
        const g = this.area.general;
        if (g.recallVNum <= 0 || (g.areaFlags & AREA_NEWFORMAT)) return '';
        return '#RECALL ' + g.recallVNum + '\n\n';
    }

    saveMobiles() {
        const mobs = this.area.mobs;
        let out = '#MOBILES\n\n';
        for (const mob of mobs) {
            out += '#' + mob.VNum + '\n';
            out += mob.keywords + '~\n';
            out += mob.shortDescr + '~\n';
            out += mob.longDescr + '\n~\n';
            out += mob.descr + '\n~\n';
            out += transToBits(mob.actFlags) + ' ';
            out += transToBits(mob.affFlags) + ' ' + mob.align + ' S\n';
            out += mob.level + ' ' + mob.reputation + ' 0 0d0+0 0d0+0\n';
            out += mob.gold + ' ' + mob.guild + '\n';
            out += '0 ' + mob.race + '~ ' + mob.sex + '\n\n';
        }
        out += '#0\n\n';
        return out;
    }

    saveObjects() {
        const objs = this.area.objs;
        let out = '#OBJECTS\n\n';
        for (const obj of objs) {
            out += '#' + obj.VNum + '\n';
            out += obj.keywords + '~\n';
            out += obj.shortDescr + '~\n';
            out += obj.longDescr + '~\n';
            out += obj.action + '~\n';
            out += obj.type + ' ' + transToBits(obj.extraFlags) + ' ';
            out += transToBits(obj.wearFlags) + '\n';
            const id = itemValues.findIndex(iv => iv.itemType === obj.type);
            for (let j = 0; j < 4; j++) {
                if (id < 0) {
                    out += obj.value[j] + '~';
                } else {
                    const vt = itemValues[id].type[j];
                    if (vt === VALUE_IS_UNUSED) {
                        out += '0~';
                    } else if (vt === VALUE_IS_SPELL) {
                        out += spells[obj.value[j]] + '~';
                    } else {
                        out += obj.value[j] + '~';
                    }
                }
                out += (j < 3) ? ' ' : '\n';
            }
            out += obj.weight + ' ' + obj.cost + ' 0\n';
            for (const ed of obj.extraDescr) {
                if (!ed.keywords && !ed.descr) continue;
                out += 'E\n' + ed.keywords + '~\n' + ed.descr + '\n~\n';
            }
            for (const at of obj.applyType) {
                out += 'A\n' + at.type + ' ' + at.value + '\n';
            }
            if (obj.wearAffs !== 0
                || (obj.wearOnMsg && obj.wearOnMsg.length > 0)
                || (obj.wearOffMsg && obj.wearOffMsg.length > 0)) {
                out += 'D\n' + transToBits(obj.wearAffs) + '\n';
                out += obj.wearOnMsg + '~\n';
                out += obj.wearOffMsg + '~\n';
            }
            out += '\n';
        }
        out += '#0\n\n';
        return out;
    }

    saveRooms() {
        const rooms = this.area.rooms;
        const isNew = this.area.general.areaFlags & AREA_NEWFORMAT;
        let out = '#ROOMS\n\n';
        for (const room of rooms) {
            if (room.resetOnly) continue;
            out += '#' + room.VNum + '\n';
            out += room.name + '~\n';
            out += room.descr + '\n~\n';
            out += '0 ' + transToBits(room.flags) + ' ' + room.sectorType + '\n';
            for (let j = 0; j <= 5; j++) {
                if (room.doors[j].VNumTo >= 0) {
                    out += 'D ' + j + '\n';
                    out += room.doors[j].descr + '~\n';
                    out += room.doors[j].keywords + '~\n';
                    out += 'B' + room.doors[j].exitFlags + ' '
                         + room.doors[j].keyVNum + ' '
                         + room.doors[j].VNumTo + '\n';
                }
            }
            for (const ed of room.extraDescr) {
                if (!ed.keywords && !ed.descr) continue;
                out += 'E\n' + ed.keywords + '~\n' + ed.descr + '\n~\n';
            }
            out += 'S\n\n';
        }
        out += '#0\n\n';
        return out;
    }

    saveResets() {
        if (this.area.general.areaFlags & AREA_NEWRESET) {
            return this.saveNewResets();
        }
        return this.saveOldResets();
    }

    saveContainedObjects(obj, emit, isNew) {
        for (const child of obj.contain) {
            const level = child.level > 0 ? child.level : 0;
            emit('P 0 ' + child.VNum + ' ' + level + ' ' + obj.VNum);
            if (child.limit > 1) {
                emit(' ' + child.limit);
            }
            const fullObj = this.getObjData(child.VNum);
            if (fullObj) {
                emit(' \t\t' + (fullObj.shortDescr || '').substring(0, 30));
            }
            emit('\n');
            this.saveContainedObjects(child, emit, isNew);
        }
    }

    saveOldResets() {
        const rooms = this.area.rooms;
        let out = '#RESETS\n\n';
        for (const room of rooms) {
            let doit1 = room.isRandom !== 0;
            let doit2 = room.objs.length > 0;
            let doit3 = room.mobs.length > 0;
            if (!doit1) {
                for (let j = 0; j <= 5; j++) {
                    if (room.doors[j].VNumTo >= 0
                        && room.doors[j].resetType !== -1) {
                        doit1 = true;
                        break;
                    }
                }
            }
            if (!doit1 && !doit2 && !doit3) continue;

            if (doit1) {
                out += '* Stanza ' + (room.name || '').substring(0, 30)
                     + ' (' + room.VNum + ') generale\n';
                if (room.isRandom) {
                    out += 'R 0 ' + room.VNum + ' ' + room.randomLevel + '\n';
                }
                for (let j = 0; j <= 5; j++) {
                    if (room.doors[j].VNumTo >= 0
                        && room.doors[j].resetType !== -1) {
                        out += 'D 0 ' + room.VNum + ' ' + j + ' '
                             + room.doors[j].resetType + '\n';
                    }
                }
            }
            if (doit2) {
                out += '* Stanza ' + (room.name || '').substring(0, 30)
                     + ' (' + room.VNum + ') oggetti\n';
                for (const obj of room.objs) {
                    const level = obj.level > 0 ? obj.level : 0;
                    out += 'O 0 ' + obj.VNum + ' ' + level + ' ' + room.VNum;
                    if (obj.limit > 1) out += ' ' + obj.limit;
                    const fullObj = this.getObjData(obj.VNum);
                    if (fullObj) {
                        out += ' \t\t' + (fullObj.shortDescr || '').substring(0, 30);
                    }
                    out += '\n';
                    this.saveContainedObjects(obj, (s) => { out += s; }, false);
                }
            }
            if (doit3) {
                out += '* Stanza ' + (room.name || '').substring(0, 30)
                     + ' (' + room.VNum + ') mobs\n';
                for (const mob of room.mobs) {
                    out += 'M 0 ' + mob.VNum + ' ' + mob.limit + ' ' + room.VNum;
                    const fullMob = this.getMobData(mob.VNum);
                    if (fullMob) {
                        out += ' \t\t' + (fullMob.shortDescr || '').substring(0, 30);
                    }
                    out += '\n';
                    for (const item of mob.contain) {
                        if (item.wearLoc === WEAR_NONE) {
                            const level = item.level > 0 ? item.level : 0;
                            out += 'G 0 ' + item.VNum + ' 0 ' + level;
                        } else {
                            out += 'E 0 ' + item.VNum + ' 0 ' + item.wearLoc;
                        }
                        const fullObj = this.getObjData(item.VNum);
                        if (fullObj) {
                            out += ' \t\t' + (fullObj.shortDescr || '').substring(0, 30);
                        }
                        out += '\n';
                        this.saveContainedObjects(item, (s) => { out += s; }, false);
                    }
                }
            }
        }
        out += 'S\n\n';
        return out;
    }

    saveNewResets() {
        const rooms = this.area.rooms;
        let out = '#RESETS\n\n';
        for (const room of rooms) {
            let doit1 = room.isRandom !== 0;
            let doit2 = room.objs.length > 0;
            let doit3 = room.mobs.length > 0;
            if (!doit1) {
                for (let j = 0; j <= 5; j++) {
                    if (room.doors[j].VNumTo >= 0
                        && room.doors[j].resetType !== -1) {
                        doit1 = true;
                        break;
                    }
                }
            }
            if (!doit1 && !doit2 && !doit3) continue;

            if (doit1) {
                out += '* Stanza ' + (room.name || '').substring(0, 30)
                     + ' (' + room.VNum + ') generale\n';
                if (room.isRandom) {
                    out += 'R 0 ' + room.VNum + ' ' + room.randomLevel + '\n';
                }
                for (let j = 0; j <= 5; j++) {
                    if (room.doors[j].VNumTo >= 0
                        && room.doors[j].resetType !== -1) {
                        out += 'D 0 ' + room.VNum + ' ' + j + ' '
                             + room.doors[j].resetType + '\n';
                    }
                }
            }
            if (doit2) {
                out += '* Stanza ' + (room.name || '').substring(0, 30)
                     + ' (' + room.VNum + ') oggetti\n';
                for (const obj of room.objs) {
                    const level = obj.level > 0 ? obj.level : 0;
                    out += 'O 0 ' + obj.VNum + ' ' + level + ' ' + room.VNum;
                    if (obj.limit > 1) out += ' ' + obj.limit;
                    const fullObj = this.getObjData(obj.VNum);
                    if (fullObj) {
                        out += ' \t\t' + (fullObj.shortDescr || '').substring(0, 30);
                    }
                    out += '\n';
                    this.saveContainedObjects(obj, (s) => { out += s; }, true);
                }
            }
            if (doit3) {
                out += '* Stanza ' + (room.name || '').substring(0, 30)
                     + ' (' + room.VNum + ') mobs\n';
                for (const mob of room.mobs) {
                    out += 'M 0 ' + mob.VNum + ' ' + mob.limit + ' ' + room.VNum;
                    if (mob.awake !== 0 || mob.sleep !== 23) {
                        out += ' ' + mob.awake + ' ' + mob.sleep;
                    }
                    const fullMob = this.getMobData(mob.VNum);
                    if (fullMob) {
                        out += ' \t\t' + (fullMob.shortDescr || '').substring(0, 30);
                    }
                    out += '\n';
                    for (const item of mob.contain) {
                        if (item.wearLoc === WEAR_NONE) {
                            const level = item.level > 0 ? item.level : 0;
                            out += 'G 0 ' + item.VNum + ' ' + level;
                            if (fullMob && fullMob.isShopKeeper) {
                                out += ' ' + item.storage;
                            }
                        } else {
                            out += 'E 0 ' + item.VNum + ' ' + item.wearLoc;
                        }
                        const fullObj = this.getObjData(item.VNum);
                        if (fullObj) {
                            out += ' \t\t' + (fullObj.shortDescr || '').substring(0, 30);
                        }
                        out += '\n';
                        this.saveContainedObjects(item, (s) => { out += s; }, true);
                    }
                }
            }
        }
        out += 'S\n\n';
        return out;
    }

    saveShops() {
        const mobs = this.area.mobs;
        let out = '#SHOPS\n\n';
        for (const mob of mobs) {
            if (!mob.isShopKeeper) continue;
            out += mob.VNum + ' ';
            for (let j = 0; j < 5; j++) {
                out += mob.buyType[j] + ' ';
            }
            out += mob.profitBuy + ' ' + mob.profitSell + ' '
                 + mob.openHour + ' ' + mob.closeHour + ' \t\t'
                 + (mob.shortDescr || '').substring(0, 30) + '\n';
        }
        out += '0\n\n';
        return out;
    }

    saveSpecials() {
        const mobs = this.area.mobs;
        const objs = this.area.objs;
        let out = '#SPECIALS\n\n';
        for (const mob of mobs) {
            if (!mob.special || mob.special.length === 0) continue;
            out += 'M ' + mob.VNum + ' ' + mob.special
                 + ' \t' + (mob.shortDescr || '') + '\n';
        }
        for (const obj of objs) {
            if (!obj.special || obj.special.length === 0) continue;
            out += 'O ' + obj.VNum + ' ' + obj.special
                 + ' \t' + (obj.shortDescr || '') + '\n';
        }
        out += 'S\n\n';
        return out;
    }
}

export function serializeFile(area) {
    const writer = new Writer(area);
    return writer.serialize();
}
