/* reset-panel.js - Reset panel editor for EditIt */

import { dirSimpleName, createLoadedObject, createLoadedMob, createMobObject, wearName, ITEM_TAKE, ITEM_CONTAINER } from './constants.js';
import { esc, getMobByVNum, getObjByVNum, getRoomByVNum, showToast } from './utils.js';
import { showSectionHelp } from './section-help.js';

// Mapping from wearFlag bits to wear location numbers
const WEAR_FLAG_TO_LOCS = {
    1:    [-1],        // ITEM_TAKE -> WEAR_NONE (inventory)
    2:    [1, 2],      // ITEM_WEAR_FINGER -> WEAR_FINGER_L, WEAR_FINGER_R
    4:    [3, 4],      // ITEM_WEAR_NECK -> WEAR_NECK_1, WEAR_NECK_2
    8:    [5],         // ITEM_WEAR_BODY -> WEAR_BODY
    16:   [6],         // ITEM_WEAR_HEAD -> WEAR_HEAD
    32:   [7],         // ITEM_WEAR_LEGS -> WEAR_LEGS
    64:   [8],         // ITEM_WEAR_FEET -> WEAR_FEET
    128:  [9],         // ITEM_WEAR_HANDS -> WEAR_HANDS
    256:  [10],        // ITEM_WEAR_ARMS -> WEAR_ARMS
    512:  [11],        // ITEM_WEAR_SHIELD -> WEAR_SHIELD
    1024: [12],        // ITEM_WEAR_ABOUT -> WEAR_ABOUT
    2048: [13],        // ITEM_WEAR_WAIST -> WEAR_WAIST
    4096: [14, 15],    // ITEM_WEAR_WRIST -> WEAR_WRIST_L, WEAR_WRIST_R
    8192: [16],        // ITEM_WIELD -> WEAR_WIELD
    16384: [17],       // ITEM_HOLD -> WEAR_HOLD
    32768: [19],       // ITEM_WEAR_EYES -> WEAR_EYES
    65536: [20],       // ITEM_WEAR_SHOULDERS -> WEAR_SHOULDERS
    131072: [21],      // ITEM_WEAR_EARS -> WEAR_EARS
    262144: [22],      // ITEM_WEAR_FOREHEAD -> WEAR_FOREHEAD
    524288: [23],      // ITEM_WEAR_CHEST -> WEAR_CHEST
};

function getWearLocsForFlags(wearFlags) {
    const locs = [];
    for (const [flag, wearLocs] of Object.entries(WEAR_FLAG_TO_LOCS)) {
        if (wearFlags & parseInt(flag, 10)) {
            locs.push(...wearLocs);
        }
    }
    return locs;
}

let currentArea = null;
let onChangeCallback = null;

export function renderResetPanel(area, onChange) {
    currentArea = area;
    onChangeCallback = onChange;
    
    const container = document.createElement('div');
    container.className = 'reset-panel form-entity';
    
    container.innerHTML = `
        <div class="form-header">
            <h3>Resets</h3>
            <small>Resets define what loads where. Add items to mobs (Give/Equip) or containers (Put).</small>
            <button class="form-help-btn outline secondary small" title="Help">?</button>
        </div>
        <div class="reset-toolbar">
            <button type="button" class="reset-add-btn" data-type="M">+ Mob</button>
            <button type="button" class="reset-add-btn" data-type="O">+ Object</button>
            <button type="button" class="reset-add-btn" data-type="D">+ Door</button>
        </div>
        <div id="reset-list"></div>
    `;
    
    // Wire up help button
    container.querySelector('.form-help-btn')?.addEventListener('click', () => showSectionHelp('resets', true));
    
    renderResetList(container);
    setupEventListeners(container);
    return container;
}

function renderResetList(container) {
    const el = container.querySelector('#reset-list');
    if (!el) return;
    
    let html = '';
    for (const room of currentArea.rooms) {
        const hasResets = room.objs.length > 0 || room.mobs.length > 0 || room.doors.some(d => d.VNumTo >= 0 && d.resetType !== -1);
        if (!hasResets) continue;
        
        html += `<div class="reset-group"><div class="reset-group-header"><span class="reset-room-name">#${room.VNum} - ${esc(room.name)}</span></div><div class="reset-items">`;
        
        // Door resets
        for (let i = 0; i <= 5; i++) {
            const door = room.doors[i];
            if (door.VNumTo >= 0 && door.resetType !== -1) {
                html += resetItem('D', room.VNum, null, `Door ${dirSimpleName[i]} → State ${door.resetType}`);
            }
        }
        
        // Object resets
        for (let i = 0; i < room.objs.length; i++) {
            const obj = room.objs[i];
            const name = getObjByVNum(currentArea.objs, obj.VNum)?.shortDescr || `oggetto di un'altra area`;
            html += resetItem('O', room.VNum, i, `#${obj.VNum} ${esc(name)} (Limit ${obj.limit})`);
            
            // Nested: Put in container (P)
            if (obj.contain?.length > 0) {
                for (let j = 0; j < obj.contain.length; j++) {
                    const child = obj.contain[j];
                    const childName = currentArea.objs.find(o => o.VNum === child.VNum)?.shortDescr || `oggetto di un'altra area`;
                    html += `<div class="reset-item reset-nested" style="margin-left:20px" data-type="P" data-room="${room.VNum}" data-obj-index="${i}" data-child-index="${j}">
                        <span class="reset-icon">📥</span><span class="reset-type">P</span>
                        <span class="reset-info">#${child.VNum} ${esc(childName)}</span>
                        <button type="button" class="reset-delete-btn" title="Remove">×</button>
                    </div>`;
                }
            }
            html += `<div class="reset-add-nested" style="margin-left:20px"><button type="button" class="add-put-btn" data-room="${room.VNum}" data-obj-index="${i}">+ Put</button></div>`;
        }
        
        // Mobile resets
        for (let i = 0; i < room.mobs.length; i++) {
            const mob = room.mobs[i];
            const name = getMobByVNum(currentArea.mobs, mob.VNum)?.shortDescr || `mob di un'altra area`;
            html += resetItem('M', room.VNum, i, `#${mob.VNum} ${esc(name)} (Limit ${mob.limit})`);
            
            // Nested: Give (G) and Equip (E)
            if (mob.contain?.length > 0) {
                for (let j = 0; j < mob.contain.length; j++) {
                    const item = mob.contain[j];
                    const itemName = currentArea.objs.find(o => o.VNum === item.VNum)?.shortDescr || `oggetto di un'altra area`;
                    const type = item.wearLoc >= 0 ? 'E' : 'G';
                    const icon = item.wearLoc >= 0 ? '⚔️' : '🎁';
                    const wear = item.wearLoc >= 0 ? ` [${wearName.find(w => w.number === item.wearLoc)?.name || item.wearLoc}]` : '';
                    html += `<div class="reset-item reset-nested" style="margin-left:20px" data-type="${type}" data-room="${room.VNum}" data-mob-index="${i}" data-child-index="${j}">
                        <span class="reset-icon">${icon}</span><span class="reset-type">${type}</span>
                        <span class="reset-info">#${item.VNum} ${esc(itemName)}${wear}</span>
                        <button type="button" class="reset-delete-btn" title="Remove">×</button>
                    </div>`;
                }
            }
            html += `<div class="reset-add-nested" style="margin-left:20px">
                <button type="button" class="add-give-btn" data-room="${room.VNum}" data-mob-index="${i}">+ Give</button>
                <button type="button" class="add-equip-btn" data-room="${room.VNum}" data-mob-index="${i}">+ Equip</button>
            </div>`;
        }
        
        html += '</div></div>';
    }
    
    el.innerHTML = html || '<p class="empty-resets">No resets defined.</p>';
}

function resetItem(type, roomVnum, index, info) {
    const icons = { M:'👤', O:'📦', D:'🚪' };
    return `<div class="reset-item" data-type="${type}" data-room="${roomVnum}" data-index="${index ?? ''}">
        <span class="reset-icon">${icons[type]}</span><span class="reset-type">${type}</span>
        <span class="reset-info">${info}</span>
        <button type="button" class="reset-edit-btn" title="Edit">✏️</button>
        <button type="button" class="reset-delete-btn" title="Delete">×</button>
    </div>`;
}

function setupEventListeners(container) {
    // Add M/O/D buttons
    container.querySelectorAll('.reset-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeOpenForms(container);
            showAddForm(container, btn.dataset.type);
        });
    });
    
    // Nested add buttons
    container.addEventListener('click', e => {
        if (e.target.classList.contains('add-give-btn')) {
            closeOpenForms(container);
            showAddGiveEquipForm(container, e.target.dataset.room, parseInt(e.target.dataset.mobIndex, 10), 'G', e.target);
        } else if (e.target.classList.contains('add-equip-btn')) {
            closeOpenForms(container);
            showAddGiveEquipForm(container, e.target.dataset.room, parseInt(e.target.dataset.mobIndex, 10), 'E', e.target);
        } else if (e.target.classList.contains('add-put-btn')) {
            closeOpenForms(container);
            showAddPutForm(container, e.target.dataset.room, parseInt(e.target.dataset.objIndex, 10), e.target);
        }
        
        // Edit buttons
        if (e.target.classList.contains('reset-edit-btn')) {
            const item = e.target.closest('.reset-item');
            if (item) {
                closeOpenForms(container);
                showEditForm(container, item);
            }
        }
        
        // Delete buttons
        if (e.target.classList.contains('reset-delete-btn')) {
            const item = e.target.closest('.reset-item');
            if (item) deleteReset(container, item);
        }
    });
}

function closeOpenForms(container) {
    container.querySelectorAll('.reset-inline-form').forEach(f => f.remove());
}

function showAddForm(container, type) {
    const listEl = container.querySelector('#reset-list');
    
    const roomOpts = currentArea.rooms.map(r => `<option value="${r.VNum}">#${r.VNum} ${esc(r.name)}</option>`).join('');
    const mobOpts = currentArea.mobs.map(m => `<option value="${m.VNum}">#${m.VNum} ${esc(m.shortDescr)}</option>`).join('');
    const objOpts = currentArea.objs.map(o => `<option value="${o.VNum}">#${o.VNum} ${esc(o.shortDescr)}</option>`).join('');
    const doorRoomOpts = currentArea.rooms.filter(r => r.doors.some(d => d.VNumTo >= 0)).map(r => `<option value="${r.VNum}">#${r.VNum} ${esc(r.name)}</option>`).join('');
    const dirOpts = dirSimpleName.map((d, i) => `<option value="${i}">${d}</option>`).join('');
    
    let fields = '';
    if (type === 'M') fields = `<label>Room <select name="roomVnum">${roomOpts}</select></label><label>Mobile <select name="mobVnum">${mobOpts}</select></label><label>Limit <input type="number" name="limit" value="1" min="1"></label>`;
    else if (type === 'O') fields = `<label>Room <select name="roomVnum">${roomOpts}</select></label><label>Object <select name="objVnum">${objOpts}</select></label><label>Limit <input type="number" name="limit" value="1" min="1"></label>`;
    else if (type === 'D') fields = `<label>Room <select name="roomVnum">${doorRoomOpts}</select></label><label>Direction <select name="door">${dirOpts}</select></label><label>State <select name="state"><option value="0">Open/unlocked</option><option value="1">Closed/unlocked</option><option value="2">Closed/locked</option></select></label>`;
    
    const formDiv = document.createElement('div');
    formDiv.className = 'reset-inline-form';
    formDiv.innerHTML = `<div class="reset-form"><h4>Add ${typeName(type)}</h4>${fields}
        <div class="reset-form-actions"><button type="button" class="reset-save-btn">Save</button><button type="button" class="reset-cancel-btn">Cancel</button></div></div>`;
    
    listEl.before(formDiv);
    
    formDiv.querySelector('.reset-save-btn').addEventListener('click', () => {
        const val = n => parseInt(formDiv.querySelector(`[name="${n}"]`)?.value, 10) || 0;
        const room = getRoomByVNum(currentArea.rooms, val('roomVnum'));
        
        if (type === 'M' && room) {
            const mob = createLoadedMob();
            mob.VNum = val('mobVnum');
            mob.limit = Math.max(1, val('limit'));
            room.mobs.push(mob);
        } else if (type === 'O' && room) {
            const obj = createLoadedObject();
            obj.VNum = val('objVnum');
            obj.limit = Math.max(1, val('limit'));
            room.objs.push(obj);
        } else if (type === 'D' && room) {
            room.doors[val('door')].resetType = val('state');
        }
        
        formDiv.remove();
        renderResetList(container);
        if (onChangeCallback) onChangeCallback();
    });
    formDiv.querySelector('.reset-cancel-btn').addEventListener('click', () => formDiv.remove());
}

function showAddGiveEquipForm(container, roomVnum, mobIndex, type, clickedBtn) {
    const room = getRoomByVNum(currentArea.rooms, parseInt(roomVnum, 10));
    if (!room) return;
    
    const mob = room.mobs[mobIndex];
    if (!mob) return;
    
    // For Give, only show objects with TAKE flag; for Equip, only show objects with wear flags
    const validObjs = type === 'G'
        ? currentArea.objs.filter(o => o.wearFlags & ITEM_TAKE)
        : type === 'E'
            ? currentArea.objs.filter(o => o.wearFlags !== 0)
            : currentArea.objs;
    const objOpts = validObjs.map(o => `<option value="${o.VNum}" data-wear="${o.wearFlags}">#${o.VNum} ${esc(o.shortDescr)}</option>`).join('');
    
    let fields = `<label>Object <select name="objVnum">${objOpts}</select></label>`;
    if (type === 'E') {
        fields += `<label>Wear Location <select name="wearLoc"></select></label>`;
    }
    
    const formDiv = document.createElement('div');
    formDiv.className = 'reset-inline-form';
    formDiv.innerHTML = `<div class="reset-form"><h4>Add ${type === 'G' ? 'Give' : 'Equip'}</h4>${fields}
        <div class="reset-form-actions"><button type="button" class="reset-save-btn">Save</button><button type="button" class="reset-cancel-btn">Cancel</button></div></div>`;
    
    // Insert form after the clicked button's parent
    if (clickedBtn) {
        clickedBtn.closest('.reset-add-nested').after(formDiv);
    } else {
        container.querySelector('#reset-list').after(formDiv);
    }
    
    // Filter wear locations when object is selected
    if (type === 'E') {
        const objSelect = formDiv.querySelector('[name="objVnum"]');
        const wearSelect = formDiv.querySelector('[name="wearLoc"]');
        
        function updateWearOptions() {
            const selected = objSelect.selectedOptions[0];
            const wearFlags = parseInt(selected?.dataset.wear || '0', 10);
            const validLocs = getWearLocsForFlags(wearFlags);
            wearSelect.innerHTML = wearName
                .filter(w => validLocs.includes(w.number))
                .map(w => `<option value="${w.number}">${w.name}</option>`)
                .join('');
        }
        
        updateWearOptions();
        objSelect.addEventListener('change', updateWearOptions);
    }
    
    formDiv.querySelector('.reset-save-btn').addEventListener('click', () => {
        const item = createMobObject();
        item.VNum = parseInt(formDiv.querySelector('[name="objVnum"]').value, 10);
        item.wearLoc = type === 'E' ? parseInt(formDiv.querySelector('[name="wearLoc"]')?.value || '-1', 10) : -1;
        item.level = 0;
        mob.contain.push(item);
        
        formDiv.remove();
        renderResetList(container);
        if (onChangeCallback) onChangeCallback();
    });
    formDiv.querySelector('.reset-cancel-btn').addEventListener('click', () => formDiv.remove());
}

function showAddPutForm(container, roomVnum, objIndex, clickedBtn) {
    const room = getRoomByVNum(currentArea.rooms, parseInt(roomVnum, 10));
    if (!room) return;
    
    const obj = room.objs[objIndex];
    if (!obj) return;
    
    // Validate that the parent object is a container
    const parentObj = getObjByVNum(currentArea.objs, obj.VNum);
    if (!parentObj || parentObj.type !== ITEM_CONTAINER) {
        showToast('Only container objects can have items put inside them', 'warning');
        return;
    }
    
    const objOpts = currentArea.objs.map(o => `<option value="${o.VNum}">#${o.VNum} ${esc(o.shortDescr)}</option>`).join('');
    
    const formDiv = document.createElement('div');
    formDiv.className = 'reset-inline-form';
    formDiv.innerHTML = `<div class="reset-form"><h4>Add Put in Container</h4><label>Object <select name="objVnum">${objOpts}</select></label>
        <div class="reset-form-actions"><button type="button" class="reset-save-btn">Save</button><button type="button" class="reset-cancel-btn">Cancel</button></div></div>`;
    
    // Insert form after the clicked button's parent
    if (clickedBtn) {
        clickedBtn.closest('.reset-add-nested').after(formDiv);
    } else {
        container.querySelector('#reset-list').after(formDiv);
    }
    
    formDiv.querySelector('.reset-save-btn').addEventListener('click', () => {
        const child = createLoadedObject();
        child.VNum = parseInt(formDiv.querySelector('[name="objVnum"]').value, 10);
        child.level = 0;
        child.limit = 1;
        obj.contain.push(child);
        
        formDiv.remove();
        renderResetList(container);
        if (onChangeCallback) onChangeCallback();
    });
    formDiv.querySelector('.reset-cancel-btn').addEventListener('click', () => formDiv.remove());
}

function showEditForm(container, item) {
    const type = item.dataset.type;
    const roomVnum = parseInt(item.dataset.room, 10);
    const index = item.dataset.index !== '' ? parseInt(item.dataset.index, 10) : null;
    
    const room = currentArea.rooms.find(r => r.VNum === roomVnum);
    if (!room) return;
    
    let fields = '';
    
    if (type === 'M' && index !== null) {
        const mob = room.mobs[index];
        fields = `<label>Mobile <select name="mobVnum">${currentArea.mobs.map(m => `<option value="${m.VNum}" ${m.VNum===mob.VNum?'selected':''}>#${m.VNum} ${esc(m.shortDescr)}</option>`).join('')}</select></label>
            <label>Limit <input type="number" name="limit" value="${mob.limit}" min="1"></label>`;
    } else if (type === 'O' && index !== null) {
        const obj = room.objs[index];
        fields = `<label>Object <select name="objVnum">${currentArea.objs.map(o => `<option value="${o.VNum}" ${o.VNum===obj.VNum?'selected':''}>#${o.VNum} ${esc(o.shortDescr)}</option>`).join('')}</select></label>
            <label>Limit <input type="number" name="limit" value="${obj.limit}" min="1"></label>`;
    } else if (type === 'D') {
        const dirIdx = dirSimpleName.findIndex(d => item.querySelector('.reset-info')?.textContent.includes(d));
        const door = room.doors[dirIdx >= 0 ? dirIdx : 0];
        fields = `<label>State <select name="state"><option value="0" ${door.resetType===0?'selected':''}>Open/unlocked</option><option value="1" ${door.resetType===1?'selected':''}>Closed/unlocked</option><option value="2" ${door.resetType===2?'selected':''}>Closed/locked</option></select></label>
            <input type="hidden" name="doorIdx" value="${dirIdx >= 0 ? dirIdx : 0}">`;
    }
    
    if (!fields) return;
    
    const formDiv = document.createElement('div');
    formDiv.className = 'reset-inline-form';
    formDiv.innerHTML = `<div class="reset-form"><h4>Edit ${typeName(type)}</h4>${fields}
        <div class="reset-form-actions"><button type="button" class="reset-save-btn">Save</button><button type="button" class="reset-cancel-btn">Cancel</button></div></div>`;
    
    item.after(formDiv);
    
    formDiv.querySelector('.reset-save-btn').addEventListener('click', () => {
        if (type === 'M' && index !== null) {
            room.mobs[index].VNum = parseInt(formDiv.querySelector('[name="mobVnum"]').value, 10);
            room.mobs[index].limit = Math.max(1, parseInt(formDiv.querySelector('[name="limit"]').value, 10));
        } else if (type === 'O' && index !== null) {
            room.objs[index].VNum = parseInt(formDiv.querySelector('[name="objVnum"]').value, 10);
            room.objs[index].limit = Math.max(1, parseInt(formDiv.querySelector('[name="limit"]').value, 10));
        } else if (type === 'D') {
            const doorIdx = parseInt(formDiv.querySelector('[name="doorIdx"]').value, 10);
            room.doors[doorIdx].resetType = parseInt(formDiv.querySelector('[name="state"]').value, 10);
        }
        formDiv.remove();
        renderResetList(container);
        if (onChangeCallback) onChangeCallback();
    });
    formDiv.querySelector('.reset-cancel-btn').addEventListener('click', () => formDiv.remove());
}

function deleteReset(container, item) {
    const type = item.dataset.type;
    const roomVnum = parseInt(item.dataset.room, 10);
    const index = item.dataset.index !== '' ? parseInt(item.dataset.index, 10) : null;
    const room = currentArea.rooms.find(r => r.VNum === roomVnum);
    if (!room) return;
    
    // Get description from the item
    const info = item.querySelector('.reset-info')?.textContent || '';
    const msg = `Delete ${typeName(type)}: ${info}?`;
    if (!confirm(msg)) return;
    
    if (type === 'M' && index !== null) room.mobs.splice(index, 1);
    else if (type === 'O' && index !== null) room.objs.splice(index, 1);
    else if (type === 'D') {
        const dirIdx = dirSimpleName.findIndex(d => item.querySelector('.reset-info')?.textContent.includes(d));
        if (dirIdx >= 0) room.doors[dirIdx].resetType = -1;
    } else if (type === 'P') {
        const objIndex = parseInt(item.dataset.objIndex, 10);
        const childIndex = parseInt(item.dataset.childIndex, 10);
        if (!isNaN(objIndex) && !isNaN(childIndex) && room.objs[objIndex]) {
            room.objs[objIndex].contain.splice(childIndex, 1);
        }
    } else if (type === 'G' || type === 'E') {
        const mobIndex = parseInt(item.dataset.mobIndex, 10);
        const childIndex = parseInt(item.dataset.childIndex, 10);
        if (!isNaN(mobIndex) && !isNaN(childIndex) && room.mobs[mobIndex]) {
            room.mobs[mobIndex].contain.splice(childIndex, 1);
        }
    }
    
    renderResetList(container);
    if (onChangeCallback) onChangeCallback();
}

function typeName(type) {
    return { M:'Load Mob', O:'Load Object', D:'Set Door', G:'Give to Mob', E:'Equip Mob', P:'Put in Container' }[type] || type;
}

