/* validation.js - Area validation engine for EditIt */

import {
    MAX_VNUM, MAXLEVEL, ITEM_MASK, ITEM_WEAR_MASK, ROOM_MASK,
    SECT_ROAD, EX_ISDOOR, EX_CLOSED, EX_LOCKED, EX_BASHED, EX_BASHPROOF, EX_PICKPROOF, EX_PASSPROOF,
    LOCK_NONE, LOCK_NPICK_NBASH_NPASS,
    DOOR_NOT_RESET, DOOR_CLOSED_LOCKED,
    ITEM_CONTAINER, ITEM_LIGHT,
    SEX_NEUTRAL, SEX_FEMALE, WEAR_NONE,
    spells, mobSpecFuncs, objSpecFuncs, races,
    itemTypeName, itemWeaponName, itemContainerFlagsName,
    itemLiquidName, itemPoisonName, itemFurnitureFlagsName,
    itemTrapType, itemTrapDamage,
    sectTypeName, lockTypeName, doorResetName, wearName, itemValues,
    VALUE_IS_SPELL, VALUE_IS_WEAPON, VALUE_IS_CONTAINER_FLAGS,
    VALUE_IS_LIQUID, VALUE_IS_POISON, VALUE_IS_FURNITURE_FLAGS,
    VALUE_IS_TRAPTYPE, VALUE_IS_TRAPDAMAGE,
    VALUE_IS_NUMBER_FROM_0, dirSimpleNameEn
} from './constants.js';

import { getMobByVNum, getObjByVNum, getRoomByVNum, escapeHtml } from './utils.js';

// ============================================================================
// Issue Severity Levels
// ============================================================================

export const SEVERITY_ERROR = 'error';
export const SEVERITY_WARNING = 'warning';
export const SEVERITY_INFO = 'info';

// ============================================================================
// Issue Categories
// ============================================================================

export const CATEGORY_DUPLICATE = 'duplicate';
export const CATEGORY_REFERENCE = 'reference';
export const CATEGORY_RANGE = 'range';
export const CATEGORY_INTEGRITY = 'integrity';
export const CATEGORY_FORMAT = 'format';

// ============================================================================
// Validation Rules
// ============================================================================

export const RULES = {
    // Errors (block save)
    'E-DUP-MOB':        { severity: SEVERITY_ERROR,   category: CATEGORY_DUPLICATE,  message: 'Duplicate VNum in mobiles' },
    'E-DUP-OBJ':        { severity: SEVERITY_ERROR,   category: CATEGORY_DUPLICATE,  message: 'Duplicate VNum in objects' },
    'E-DUP-ROOM':       { severity: SEVERITY_ERROR,   category: CATEGORY_DUPLICATE,  message: 'Duplicate VNum in rooms' },
    'E-VNUM-RANGE':     { severity: SEVERITY_ERROR,   category: CATEGORY_RANGE,      message: 'VNum outside valid range (1-65534)' },

    // Warnings (advise before save)
    'W-EXIT-DEST':        { severity: SEVERITY_WARNING, category: CATEGORY_REFERENCE, message: 'Exit destination room does not exist' },
    'W-KEY-REF':          { severity: SEVERITY_WARNING, category: CATEGORY_REFERENCE, message: 'Key VNum does not reference an object' },
    'I-RESET-MOB':        { severity: SEVERITY_INFO,    category: CATEGORY_REFERENCE, message: 'Reset references mob not in this area' },
    'I-RESET-OBJ':        { severity: SEVERITY_INFO,    category: CATEGORY_REFERENCE, message: 'Reset references object not in this area' },
    'W-RESET-ROOM':       { severity: SEVERITY_WARNING, category: CATEGORY_REFERENCE, message: 'Reset references non-existent room' },
    'W-RESET-CONTAINER':  { severity: SEVERITY_WARNING, category: CATEGORY_REFERENCE, message: 'P-reset container is not ITEM_CONTAINER type' },
    'W-RESET-ORDER':      { severity: SEVERITY_WARNING, category: CATEGORY_INTEGRITY, message: 'G/E reset without preceding M reset' },
    'W-RESET-ORDER-P':    { severity: SEVERITY_WARNING, category: CATEGORY_INTEGRITY, message: 'P reset without preceding O reset' },
    'W-FIELD-RANGE':      { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Field value outside expected range' },
    'W-SPECIAL-REF':      { severity: SEVERITY_WARNING, category: CATEGORY_REFERENCE, message: 'Special function name not recognized' },
    'W-DOOR-KEY':         { severity: SEVERITY_WARNING, category: CATEGORY_INTEGRITY, message: 'Locked door has no key defined' },
    'W-DOOR-DESC':        { severity: SEVERITY_WARNING, category: CATEGORY_INTEGRITY, message: 'Door has no keywords defined' },
    'W-INVALID-TYPE':     { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid item type' },
    'W-INVALID-FLAGS':    { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid flag bits set' },
    'W-INVALID-WEAPON':   { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid weapon type' },
    'W-INVALID-SPELL':    { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid spell name' },
    'W-INVALID-LIQUID':   { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid liquid type' },
    'W-INVALID-POISON':   { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid poison type' },
    'W-INVALID-TRAP':     { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid trap type or damage' },
    'W-INVALID-FURNITURE':{ severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid furniture flags' },
    'W-INVALID-CONTAINER':{ severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid container flags' },
    'W-INVALID-SECTOR':   { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid sector type' },
    'W-INVALID-LOCK':     { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,     message: 'Invalid lock type' },
    'W-INVALID-DOOR-RESET': { severity: SEVERITY_WARNING, category: CATEGORY_RANGE,   message: 'Invalid door reset state' },

    // Info (suggestions)
    'I-ORPHAN-MOB':   { severity: SEVERITY_INFO, category: CATEGORY_INTEGRITY, message: 'Mob defined but never loaded by resets' },
    'I-ORPHAN-OBJ':   { severity: SEVERITY_INFO, category: CATEGORY_INTEGRITY, message: 'Object defined but never placed in resets' },
    'I-ORPHAN-ROOM':  { severity: SEVERITY_INFO, category: CATEGORY_INTEGRITY, message: 'Room with no mobs, objects, or exits' },
    'I-EMPTY-DESC':   { severity: SEVERITY_INFO, category: CATEGORY_FORMAT,    message: 'Entity has empty description field' },
    'I-AREA-RECALL':  { severity: SEVERITY_INFO, category: CATEGORY_INTEGRITY, message: 'Recall VNum is 0 (no recall point)' },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create an issue object
 */
function issue(rule, entityType, vnum, field, extra = {}) {
    const ruleDef = RULES[rule];
    if (!ruleDef) throw new Error(`Unknown rule: ${rule}`);
    return {
        rule,
        severity: ruleDef.severity,
        category: ruleDef.category,
        message: ruleDef.message,
        entityType,
        vnum,
        field,
        nodeId: `${entityType === 'object' ? 'obj' : entityType}-${vnum}`,
        ...extra
    };
}

/**
 * Check if value has any bits set outside the valid mask
 */
function hasInvalidBits(value, mask) {
    return (value & ~mask) !== 0;
}

/**
 * Validate a value is in a lookup table
 */
function isValidLookup(value, table) {
    return table.some(item => item.number === value);
}

/**
 * Validate a spell name (for VALUE_IS_SPELL)
 */
function isValidSpell(value) {
    if (value === 0) return true; // 0 means no spell
    // Spells are stored by index in the spells array
    return value > 0 && value < spells.length && spells[value] !== '';
}

/**
 * Get formatted direction string like "0 (north)"
 */
function dirStr(dir) {
    return `${dir} (${dirSimpleNameEn[dir]})`;
}

// ============================================================================
// Duplicate VNum Detection
// ============================================================================

function checkDuplicateVnums(entities, entityType) {
    const issues = [];
    const seen = new Map();

    for (const entity of entities) {
        const vnum = entity.VNum;
        seen.set(vnum, (seen.get(vnum) || 0) + 1);
    }

    for (const [vnum, count] of seen) {
        if (count > 1) {
            const rule = entityType === 'mob' ? 'E-DUP-MOB' :
                        entityType === 'object' ? 'E-DUP-OBJ' : 'E-DUP-ROOM';
            issues.push(issue(rule, entityType, vnum, 'VNum', {
                message: `Duplicate VNum #${vnum} found ${count} times`
            }));
        }
    }

    return issues;
}

// ============================================================================
// VNum Range Validation
// ============================================================================

function checkVnumRange(entities, entityType) {
    const issues = [];

    for (const entity of entities) {
        const vnum = entity.VNum;
        if (vnum < 1 || vnum >= MAX_VNUM) {
            issues.push(issue('E-VNUM-RANGE', entityType, vnum, 'VNum', {
                message: `VNum ${vnum} outside valid range (1-${MAX_VNUM - 1})`
            }));
        }
    }

    return issues;
}

// ============================================================================
// Mobile Validation
// ============================================================================

function checkMobiles(mobs) {
    const issues = [];
    if (!mobs || !Array.isArray(mobs)) return issues;

    for (const mob of mobs) {
        // Level range (no upper limit, matching C++ behavior)
        if (mob.level < 0) {
            issues.push(issue('W-FIELD-RANGE', 'mob', mob.VNum, 'level', {
                message: `Level ${mob.level} is negative`
            }));
        }

        // Alignment range
        if (mob.align < -1000 || mob.align > 1000) {
            issues.push(issue('W-FIELD-RANGE', 'mob', mob.VNum, 'align', {
                message: `Alignment ${mob.align} outside range (-1000 to 1000)`
            }));
        }

        // Reputation range
        if (mob.reputation < -1000 || mob.reputation > 1000) {
            issues.push(issue('W-FIELD-RANGE', 'mob', mob.VNum, 'reputation', {
                message: `Reputation ${mob.reputation} outside range (-1000 to 1000)`
            }));
        }

        // Sex validation
        if (mob.sex < SEX_NEUTRAL || mob.sex > SEX_FEMALE) {
            issues.push(issue('W-FIELD-RANGE', 'mob', mob.VNum, 'sex', {
                message: `Sex ${mob.sex} is invalid (0=Neutral, 1=Male, 2=Female)`
            }));
        }

        // Race validation
        if (mob.race && !races.some(r => r.english === mob.race || r.italian === mob.race)) {
            issues.push(issue('W-FIELD-RANGE', 'mob', mob.VNum, 'race', {
                message: `Race "${mob.race}" not in known races list`
            }));
        }

        // Gold range
        if (mob.gold < 0 || mob.gold > 999999) {
            issues.push(issue('W-FIELD-RANGE', 'mob', mob.VNum, 'gold', {
                message: `Gold ${mob.gold} outside range (0-999999)`
            }));
        }

        // Special function validation
        if (mob.special && mob.special !== '') {
            if (!mobSpecFuncs.some(s => s === mob.special)) {
                issues.push(issue('W-SPECIAL-REF', 'mob', mob.VNum, 'special', {
                    message: `Special function "${mob.special}" not in known list`
                }));
            }
        }
    }

    return issues;
}

// ============================================================================
// Object Validation
// ============================================================================

function checkObjects(objs) {
    const issues = [];
    if (!objs || !Array.isArray(objs)) return issues;

    for (const obj of objs) {
        // Type validation
        if (!isValidLookup(obj.type, itemTypeName)) {
            issues.push(issue('W-INVALID-TYPE', 'object', obj.VNum, 'type', {
                message: `Object type ${obj.type} is not a valid item type`
            }));
        }

        // Extra flags validation
        if (hasInvalidBits(obj.extraFlags, ITEM_MASK)) {
            issues.push(issue('W-INVALID-FLAGS', 'object', obj.VNum, 'extraFlags', {
                message: `Extra flags have invalid bits set (0x${obj.extraFlags.toString(16)})`
            }));
        }

        // Wear flags validation
        if (hasInvalidBits(obj.wearFlags, ITEM_WEAR_MASK)) {
            issues.push(issue('W-INVALID-FLAGS', 'object', obj.VNum, 'wearFlags', {
                message: `Wear flags have invalid bits set (0x${obj.wearFlags.toString(16)})`
            }));
        }

        // Weight range
        if (obj.weight < 0 || obj.weight > 99999) {
            issues.push(issue('W-FIELD-RANGE', 'object', obj.VNum, 'weight', {
                message: `Weight ${obj.weight} outside range (0-99999)`
            }));
        }



        // Validate values based on type
        const valueInfo = itemValues.find(v => v.itemType === obj.type);
        if (valueInfo) {
            for (let i = 0; i < 4; i++) {
                const valType = valueInfo.type[i];
                const val = obj.value[i];

                switch (valType) {
                    case VALUE_IS_SPELL:
                        if (!isValidSpell(val)) {
                            issues.push(issue('W-INVALID-SPELL', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: "${val}" is not a valid spell`
                            }));
                        }
                        break;

                    case VALUE_IS_WEAPON:
                        if (!isValidLookup(val, itemWeaponName)) {
                            issues.push(issue('W-INVALID-WEAPON', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Weapon type ${val} is not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_CONTAINER_FLAGS:
                        if (!isValidLookup(val, itemContainerFlagsName)) {
                            issues.push(issue('W-INVALID-CONTAINER', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Container flags ${val} are not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_LIQUID:
                        if (!isValidLookup(val, itemLiquidName)) {
                            issues.push(issue('W-INVALID-LIQUID', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Liquid type ${val} is not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_POISON:
                        if (!isValidLookup(val, itemPoisonName)) {
                            issues.push(issue('W-INVALID-POISON', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Poison type ${val} is not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_FURNITURE_FLAGS:
                        if (!isValidLookup(val, itemFurnitureFlagsName)) {
                            issues.push(issue('W-INVALID-FURNITURE', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Furniture flags ${val} are not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_TRAPTYPE:
                        if (!isValidLookup(val, itemTrapType)) {
                            issues.push(issue('W-INVALID-TRAP', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Trap type ${val} is not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_TRAPDAMAGE:
                        if (!isValidLookup(val, itemTrapDamage)) {
                            issues.push(issue('W-INVALID-TRAP', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: Trap damage ${val} is not valid`
                            }));
                        }
                        break;

                    case VALUE_IS_NUMBER_FROM_0:
                        if (val < 0) {
                            issues.push(issue('W-FIELD-RANGE', 'object', obj.VNum, `value[${i}]`, {
                                message: `Value ${i + 1}: ${val} must be >= 0`
                            }));
                        }
                        break;
                }
            }
        }

        // Special function validation
        if (obj.special && obj.special !== '') {
            if (!objSpecFuncs.some(s => s === obj.special)) {
                issues.push(issue('W-SPECIAL-REF', 'obj', obj.VNum, 'special', {
                    message: `Special function "${obj.special}" not in known list`
                }));
            }
        }
    }

    return issues;
}

// ============================================================================
// Room Validation
// ============================================================================

function checkRooms(rooms) {
    const issues = [];
    if (!rooms || !Array.isArray(rooms)) return issues;

    for (const room of rooms) {
        // Flags validation
        if (hasInvalidBits(room.flags, ROOM_MASK)) {
            issues.push(issue('W-INVALID-FLAGS', 'room', room.VNum, 'flags', {
                message: `Room flags have invalid bits set (0x${room.flags.toString(16)})`
            }));
        }

        // Sector type validation
        if (!isValidLookup(room.sectorType, sectTypeName)) {
            issues.push(issue('W-INVALID-SECTOR', 'room', room.VNum, 'sectorType', {
                message: `Sector type ${room.sectorType} is not valid`
            }));
        }

        // Door validation
        for (let dir = 0; dir <= 5; dir++) {
            const door = room.doors[dir];

            // Lock type validation
            if (door.lockType < 0) {
                issues.push(issue('W-INVALID-LOCK', 'room', room.VNum, `doors[${dir}].lockType`, {
                    message: `Direction ${dirStr(dir)}: Lock type ${door.lockType} is negative`
                }));
            }

            // Door reset state validation
            if (door.resetType < -1 || door.resetType > 2) {
                issues.push(issue('W-INVALID-DOOR-RESET', 'room', room.VNum, `doors[${dir}].resetType`, {
                    message: `Direction ${dirStr(dir)}: Door reset type ${door.resetType} is not valid (-1 to 2)`
                }));
            }

            // Door with lockType but no keywords (only for actual doors, not regular exits)
            if (door.VNumTo >= 0 && door.lockType !== LOCK_NONE && (!door.keywords || door.keywords === '')) {
                issues.push(issue('W-DOOR-DESC', 'room', room.VNum, `doors[${dir}].keywords`, {
                    message: `Direction ${dirStr(dir)}: Door has no keywords defined`
                }));
            }


        }
    }

    return issues;
}

// ============================================================================
// Cross-Reference Validation
// ============================================================================

function checkCrossReferences(area) {
    const issues = [];

    if (!area.rooms || !Array.isArray(area.rooms)) return issues;

    // Exit references
    for (const room of area.rooms) {
        for (let dir = 0; dir <= 5; dir++) {
            const door = room.doors[dir];
            if (door.VNumTo >= 0) {
                const destRoom = getRoomByVNum(area.rooms, door.VNumTo);
                if (!destRoom) {
                    issues.push(issue('W-EXIT-DEST', 'room', room.VNum, `doors[${dir}].VNumTo`, {
                        message: `Direction ${dirStr(dir)}: Exit destination #${door.VNumTo} does not exist in this area`
                    }));
                }

                // Key reference
                if (door.keyVNum > 0) {
                    const keyObj = getObjByVNum(area.objs, door.keyVNum);
                    if (!keyObj) {
                        issues.push(issue('W-KEY-REF', 'room', room.VNum, `doors[${dir}].keyVNum`, {
                            message: `Direction ${dirStr(dir)}: Key #${door.keyVNum} does not exist in this area`
                        }));
                    }
                }
            }
        }
    }

    return issues;
}

// ============================================================================
// Reset Validation (context-aware)
// ============================================================================

function checkResets(area) {
    const issues = [];
    let lastMob = null;      // Last mob VNum loaded by M reset
    const loadedContainers = new Set();  // Obj VNums loaded by O resets

    if (!area.rooms || !Array.isArray(area.rooms)) return issues;

    for (const room of area.rooms) {
        // Check mob resets
        for (const loadedMob of room.mobs) {
            const mob = getMobByVNum(area.mobs, loadedMob.VNum);
            if (!mob) {
                issues.push(issue('I-RESET-MOB', 'room', room.VNum, null, {
                    message: `Mob #${loadedMob.VNum} loaded in room #${room.VNum} does not exist in this area`
                }));
            }
            lastMob = loadedMob.VNum;

            // Check mob inventory (G/E resets)
            if (loadedMob.contain && Array.isArray(loadedMob.contain)) {
                for (const mobObj of loadedMob.contain) {
                    const obj = getObjByVNum(area.objs, mobObj.VNum);
                    if (!obj) {
                        issues.push(issue('I-RESET-OBJ', 'room', room.VNum, null, {
                            message: `Object #${mobObj.VNum} given/equipped to mob #${loadedMob.VNum} does not exist in this area`
                        }));
                    }

                    // Check wear location for E resets
                    if (mobObj.wearLoc !== WEAR_NONE && mobObj.wearLoc !== undefined) {
                        if (!isValidLookup(mobObj.wearLoc, wearName)) {
                            issues.push(issue('W-FIELD-RANGE', 'room', room.VNum, null, {
                                message: `Object #${mobObj.VNum} has invalid wear location ${mobObj.wearLoc}`
                            }));
                        }
                    }
                }
            }
        }

        // Check object resets
        for (const loadedObj of room.objs) {
            const obj = getObjByVNum(area.objs, loadedObj.VNum);
            if (!obj) {
                issues.push(issue('I-RESET-OBJ', 'room', room.VNum, null, {
                    message: `Object #${loadedObj.VNum} loaded in room #${room.VNum} does not exist in this area`
                }));
            }
            loadedContainers.add(loadedObj.VNum);

            // Check container type for P resets
            if (obj && obj.type !== ITEM_CONTAINER && loadedObj.contain && loadedObj.contain.length > 0) {
                issues.push(issue('W-RESET-CONTAINER', 'room', room.VNum, null, {
                    message: `Object #${loadedObj.VNum} is not a container but has items put in it`
                }));
            }

            // Check contained objects (P resets)
            if (loadedObj.contain && Array.isArray(loadedObj.contain)) {
                for (const contained of loadedObj.contain) {
                    const containedObj = getObjByVNum(area.objs, contained.VNum);
                    if (!containedObj) {
                        issues.push(issue('I-RESET-OBJ', 'room', room.VNum, null, {
                            message: `Object #${contained.VNum} put in container #${loadedObj.VNum} does not exist in this area`
                        }));
                    }
                }
            }
        }

        // Check door resets
        for (let dir = 0; dir <= 5; dir++) {
            const door = room.doors[dir];
            if (door.resetType !== -1) {
                // Door has a reset defined
                if (door.VNumTo === -1) {
                    issues.push(issue('W-RESET-ROOM', 'room', room.VNum, `doors[${dir}]`, {
                        message: `Direction ${dirStr(dir)}: Door reset defined but no exit exists`
                    }));
                }
            }
        }
    }

    return issues;
}

// ============================================================================
// Integrity Checks
// ============================================================================

function checkIntegrity(area) {
    const issues = [];

    // Area recall
    if (area.general.recallVNum === 0) {
        issues.push(issue('I-AREA-RECALL', 'area', 0, 'recallVNum', {
            message: 'Recall VNum is 0 (no recall point set)'
        }));
    }

    if (!area.rooms || !Array.isArray(area.rooms)) return issues;

    // Orphan detection - mobs
    const loadedMobVnums = new Set();
    for (const room of area.rooms) {
        if (room.mobs && Array.isArray(room.mobs)) {
            for (const mob of room.mobs) {
                loadedMobVnums.add(mob.VNum);
            }
        }
    }
    if (area.mobs && Array.isArray(area.mobs)) {
        for (const mob of area.mobs) {
            if (!loadedMobVnums.has(mob.VNum)) {
                issues.push(issue('I-ORPHAN-MOB', 'mob', mob.VNum, null, {
                    message: `Mob #${mob.VNum} (${mob.shortDescr}) is never loaded by any reset`
                }));
            }
        }
    }

    // Orphan detection - objects
    const loadedObjVnums = new Set();
    for (const room of area.rooms) {
        if (room.objs && Array.isArray(room.objs)) {
            for (const obj of room.objs) {
                loadedObjVnums.add(obj.VNum);
            }
        }
        if (room.mobs && Array.isArray(room.mobs)) {
            for (const mob of room.mobs) {
                if (mob.contain && Array.isArray(mob.contain)) {
                    for (const mobObj of mob.contain) {
                        loadedObjVnums.add(mobObj.VNum);
                    }
                }
            }
        }
    }
    if (area.objs && Array.isArray(area.objs)) {
        for (const obj of area.objs) {
            if (!loadedObjVnums.has(obj.VNum)) {
                issues.push(issue('I-ORPHAN-OBJ', 'object', obj.VNum, null, {
                    message: `Object #${obj.VNum} (${obj.shortDescr}) is never placed by any reset`
                }));
            }
        }
    }

    // Orphan detection - rooms (empty rooms with no mobs, objects, or exits)
    for (const room of area.rooms) {
        if (room.resetOnly) continue; // Skip reset-only rooms
        const hasExits = room.doors && room.doors.some(d => d.VNumTo >= 0);
        const hasMobs = room.mobs && room.mobs.length > 0;
        const hasObjs = room.objs && room.objs.length > 0;
        if (!hasExits && !hasMobs && !hasObjs) {
            issues.push(issue('I-ORPHAN-ROOM', 'room', room.VNum, null, {
                message: `Room #${room.VNum} (${room.name}) has no exits, mobs, or objects`
            }));
        }
    }

    return issues;
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate an area and return all issues found.
 * @param {Object} area - The area data object
 * @returns {Array} Array of issue objects, sorted by severity
 */
export function validateAll(area) {
    if (!area) return [];

    const allIssues = [];

    // 1. Duplicate VNum detection
    if (area.mobs) allIssues.push(...checkDuplicateVnums(area.mobs, 'mob'));
    if (area.objs) allIssues.push(...checkDuplicateVnums(area.objs, 'object'));
    if (area.rooms) allIssues.push(...checkDuplicateVnums(area.rooms, 'room'));

    // 2. VNum range validation
    if (area.mobs) allIssues.push(...checkVnumRange(area.mobs, 'mob'));
    if (area.objs) allIssues.push(...checkVnumRange(area.objs, 'object'));
    if (area.rooms) allIssues.push(...checkVnumRange(area.rooms, 'room'));

    // 3. Mobile field validation
    if (area.mobs) allIssues.push(...checkMobiles(area.mobs));

    // 4. Object field validation
    if (area.objs) allIssues.push(...checkObjects(area.objs));

    // 5. Room field validation
    if (area.rooms) allIssues.push(...checkRooms(area.rooms));

    // 6. Cross-reference validation
    allIssues.push(...checkCrossReferences(area));

    // 7. Reset validation
    allIssues.push(...checkResets(area));

    // 8. Integrity checks
    allIssues.push(...checkIntegrity(area));

    // Sort by severity (errors first, then warnings, then info)
    const severityOrder = { error: 0, warning: 1, info: 2 };
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return allIssues;
}

// ============================================================================
// Utility Functions for UI
// ============================================================================

/**
 * Count issues by severity
 * @param {Array} issues - Array of issue objects
 * @returns {Object} { errors, warnings, info, total }
 */
export function countBySeverity(issues) {
    const counts = { errors: 0, warnings: 0, info: 0, total: issues.length };
    for (const issue of issues) {
        if (issue.severity === SEVERITY_ERROR) counts.errors++;
        else if (issue.severity === SEVERITY_WARNING) counts.warnings++;
        else counts.info++;
    }
    return counts;
}

/**
 * Filter issues by visibility settings
 * @param {Array} issues - Array of issue objects
 * @param {Object} filters - { showErrors, showWarnings, showInfo }
 * @returns {Array} Filtered issues
 */
export function filterIssues(issues, filters = {}) {
    const { showErrors = true, showWarnings = true, showInfo = true } = filters;
    return issues.filter(issue => {
        if (issue.severity === SEVERITY_ERROR && !showErrors) return false;
        if (issue.severity === SEVERITY_WARNING && !showWarnings) return false;
        if (issue.severity === SEVERITY_INFO && !showInfo) return false;
        return true;
    });
}

/**
 * Get severity icon for display
 * @param {string} severity - Issue severity
 * @returns {string} Icon character
 */
export function getSeverityIcon(severity) {
    switch (severity) {
        case SEVERITY_ERROR: return '🔴';
        case SEVERITY_WARNING: return '🟡';
        case SEVERITY_INFO: return 'ℹ️';
        default: return '❓';
    }
}

/**
 * Check if there are any errors that should block save
 * @param {Array} issues - Array of issue objects
 * @returns {boolean} True if there are blocking errors
 */
export function hasBlockingErrors(issues) {
    return issues.some(i => i.severity === SEVERITY_ERROR);
}

// ============================================================================
// Validation Panel UI
// ============================================================================

let validationState = {
    issues: [],
    showErrors: true,
    showWarnings: true,
    showInfo: true,
    autoValidate: true
};

/**
 * Initialize the validation panel event listeners
 * @param {Function} onNavigate - Callback when an issue is clicked (issue) => void
 */
export function initValidationPanel(onNavigate) {
    const panel = document.getElementById('validation-panel');
    const closeBtn = document.getElementById('btn-validate-close');
    const clearBtn = document.getElementById('btn-validate-clear');
    const validateOnSaveCheckbox = document.getElementById('validate-on-save');
    const filterBtns = panel.querySelectorAll('.filter-btn');

    // Close button
    closeBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        validationState.issues = [];
        renderValidationList();
        panel.classList.add('hidden');
    });

    // Validate on save checkbox
    validateOnSaveCheckbox.addEventListener('change', (e) => {
        validationState.autoValidate = e.target.checked;
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const filter = btn.dataset.filter;
            if (filter === 'error') validationState.showErrors = btn.classList.contains('active');
            else if (filter === 'warning') validationState.showWarnings = btn.classList.contains('active');
            else if (filter === 'info') validationState.showInfo = btn.classList.contains('active');
            else if (filter === 'all') {
                const isActive = btn.classList.contains('active');
                validationState.showErrors = isActive;
                validationState.showWarnings = isActive;
                validationState.showInfo = isActive;
                filterBtns.forEach(b => {
                    if (b.dataset.filter !== 'all') {
                        if (isActive) b.classList.add('active');
                        else b.classList.remove('active');
                    }
                });
            }
            renderValidationList();
        });
    });

    // Store navigate callback
    validationState.onNavigate = onNavigate;
}

/**
 * Run validation and show the panel
 * @param {Object} area - The area data
 */
export function runValidation(area) {
    validationState.issues = validateAll(area);
    const panel = document.getElementById('validation-panel');
    panel.classList.remove('hidden');
    renderValidationList();
}

/**
 * Get the current validation state
 */
export function getValidationState() {
    return validationState;
}

/**
 * Check if auto-validate is enabled
 */
export function shouldAutoValidate() {
    return validationState.autoValidate;
}

/**
 * Render the validation issue list
 */
function renderValidationList() {
    const listEl = document.getElementById('validation-list');
    const summaryEl = document.getElementById('validation-summary');

    const filtered = filterIssues(validationState.issues, {
        showErrors: validationState.showErrors,
        showWarnings: validationState.showWarnings,
        showInfo: validationState.showInfo
    });

    const counts = countBySeverity(validationState.issues);

    // Update summary
    const parts = [];
    if (counts.errors > 0) parts.push(`${counts.errors} error${counts.errors !== 1 ? 's' : ''}`);
    if (counts.warnings > 0) parts.push(`${counts.warnings} warning${counts.warnings !== 1 ? 's' : ''}`);
    if (counts.info > 0) parts.push(`${counts.info} info`);
    summaryEl.textContent = parts.length > 0 ? parts.join(', ') : 'No issues found';

    // Render list
    if (filtered.length === 0) {
        listEl.innerHTML = '<div class="validation-empty">No issues to display</div>';
        return;
    }

    listEl.innerHTML = filtered.map(issue => `
        <div class="validation-issue severity-${issue.severity}" data-rule="${issue.rule}" data-entity-type="${issue.entityType}" data-vnum="${issue.vnum}" data-node-id="${issue.nodeId}">
            <span class="validation-icon">${getSeverityIcon(issue.severity)}</span>
            <span class="validation-message">${escapeHtml(issue.message)}</span>
            ${issue.vnum ? `<span class="validation-location"><span class="validation-link">#${issue.vnum}</span></span>` : ''}
        </div>
    `).join('');

    // Add click handlers
    listEl.querySelectorAll('.validation-issue').forEach(el => {
        el.addEventListener('click', () => {
            const nodeId = el.dataset.nodeId;
            if (nodeId && validationState.onNavigate) {
                validationState.onNavigate({
                    nodeId,
                    entityType: el.dataset.entityType,
                    vnum: parseInt(el.dataset.vnum, 10)
                });
            }
        });
    });
}


