/* room-form.js - Room editor form for EditIt */

import {
    roomFlagsName, sectTypeName, exitFlagsName, doorResetName,
    dirSimpleName, dirName, dirSimpleNameEn, createDoor,
    createLoadedObject, createLoadedMob,
    EX_ISDOOR, EX_WINDOW, REV_DIR
} from './constants.js';
import { createFlagGroup } from './flags.js';
import { escapeHtml, wrapTextareaWithGuide, setupTabs, getRoomByVNum, showToast } from './utils.js';

export function renderRoomForm(room, onChange, options = {}) {
    const { readonly = false, area = null } = options;
    const container = document.createElement('div');
    container.className = 'room-form form-entity';
    
    container.innerHTML = `
        <div class="form-header">
            <h3>#${room.VNum}${room.name ? ' - ' + escapeHtml(room.name) : ''}</h3>
        </div>
        <div class="form-tabs">
            <button type="button" class="form-tab-btn active" data-tab="basic">Basic</button>
            <button type="button" class="form-tab-btn" data-tab="exits">Exits</button>
            <button type="button" class="form-tab-btn" data-tab="extras">Extras</button>
            <button type="button" class="form-tab-btn" data-tab="contents">Contents</button>
        </div>
        <div class="form-tab-content active" data-tab="basic">
            <div class="form-section">
                <label>Name</label>
                <input type="text" name="name" value="${escapeHtml(room.name)}" ${readonly ? 'disabled' : ''}>
            </div>
            <div class="form-section">
                <label>Description</label>
                <textarea name="descr" rows="6" ${readonly ? 'disabled' : ''}>${escapeHtml(room.descr)}</textarea>
            </div>
            <div class="form-row">
                <div class="form-section">
                    <label>Sector Type</label>
                    <select name="sectorType" ${readonly ? 'disabled' : ''}>
                        ${sectTypeName.map(s => `<option value="${s.number}" ${room.sectorType===s.number?'selected':''}>${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-section">
                <label>
                    <input type="checkbox" name="resetOnly" ${room.resetOnly ? 'checked' : ''} ${readonly ? 'disabled' : ''}>
                    Reset Only <span class="hint">(room exists only for resets)</span>
                </label>
            </div>
            <div class="form-section">
                <h4>Room Flags</h4>
                <div id="room-flags"></div>
            </div>
        </div>
        <div class="form-tab-content" data-tab="exits">
            <div id="room-exits"></div>
        </div>
        <div class="form-tab-content" data-tab="extras">
            <div class="form-section">
                <h4>Extra Descriptions</h4>
                <div id="room-extras"></div>
                <button type="button" class="add-extra-btn" ${readonly ? 'disabled' : ''}>+ Add Extra</button>
            </div>
        </div>
        <div class="form-tab-content" data-tab="contents">
            <div class="form-section">
                <h4>Loaded Objects</h4>
                <div id="room-objs"></div>
            </div>
            <div class="form-section">
                <h4>Loaded Mobiles</h4>
                <div id="room-mobs"></div>
            </div>
        </div>
    `;
    
    renderFlags(container, room, onChange, readonly);
    renderExits(container, room, onChange, readonly, options);
    renderExtras(container, room, onChange, readonly);
    renderContents(container, room, onChange, readonly, area);
    setupTabs(container);
    
    // Wrap description textareas with column guide
    container.querySelectorAll('textarea[name="descr"]').forEach(ta => {
        wrapTextareaWithGuide(ta, 75);
    });
    container.querySelectorAll('textarea[name^="exit_descr"]').forEach(ta => {
        wrapTextareaWithGuide(ta, 80);
    });
    // Note: extra_descr textareas are wrapped in renderExtras > renderList
    
    if (!readonly) attachChangeHandlers(container, room, onChange);
    
    return container;
}

function renderFlags(container, room, onChange, readonly) {
    const el = container.querySelector('#room-flags');
    if (!el) return;
    const flagsData = roomFlagsName.map((n, i) => n ? { value: Math.pow(2, i), label: n } : null).filter(Boolean);
    el.appendChild(createFlagGroup('flags', flagsData, room.flags, v => {
        room.flags = v;
        if (onChange) onChange(room);
    }, { columns: 3, disabled: readonly }).container);
}

function getReverseBtnLabel(room, dirIdx, options) {
    const door = room.doors[dirIdx];
    if (door.VNumTo === -1 || !options.area) return 'Create reverse exit';
    const destRoom = getRoomByVNum(options.area.rooms, door.VNumTo);
    if (!destRoom) return 'Create reverse exit';
    const oppDir = REV_DIR[dirIdx];
    const oppDoor = destRoom.doors[oppDir];
    if (oppDoor && oppDoor.VNumTo === room.VNum) return 'Update reverse exit';
    return 'Create reverse exit';
}

function renderExits(container, room, onChange, readonly, options = {}) {
    const el = container.querySelector('#room-exits');
    if (!el) return;
    
    const directions = ['Nord', 'Est', 'Sud', 'Ovest', 'Alto', 'Basso'];
    const icons = ['↑', '→', '↓', '←', '⬆', '⬇'];
    
    let html = '<div class="exits-container">';
    directions.forEach((dir, i) => {
        const door = room.doors[i];
        const hasExit = door.VNumTo !== -1;
        html += `
            <div class="exit-panel ${hasExit ? 'has-exit' : ''}">
                <div class="exit-header" data-index="${i}">
                    <span class="exit-icon">${icons[i]}</span>
                    <span class="exit-dir">${dir}</span>
                    <span class="exit-status">${hasExit ? `→ #${door.VNumTo}` : 'No exit'}</span>
                </div>
                <div class="exit-details" data-index="${i}">
                    <div class="form-row">
                        <div class="form-section">
                            <label>Destination VNum</label>
                            <input type="number" name="exit_vnumto_${i}" value="${door.VNumTo}" min="-1" max="65534" ${readonly ? 'disabled' : ''}>
                        </div>
                        <div class="form-section">
                            <label>Key VNum</label>
                            <input type="number" name="exit_keyvnum_${i}" value="${door.keyVNum}" min="-1" max="65534" ${readonly ? 'disabled' : ''}>
                        </div>
                    </div>
                    <div class="form-section">
                        <label>Keywords</label>
                        <input type="text" name="exit_keywords_${i}" value="${escapeHtml(door.keywords)}" placeholder="porta door" ${readonly ? 'disabled' : ''}>
                    </div>
                    <div class="form-section">
                        <label>Description</label>
                        <textarea name="exit_descr_${i}" rows="2" ${readonly ? 'disabled' : ''}>${escapeHtml(door.descr)}</textarea>
                    </div>
                    <div class="form-section">
                        <label>Exit Flags</label>
                        <div class="exit-flags" id="exit-flags-${i}"></div>
                    </div>
                    <div class="form-section">
                        <label>Reset State</label>
                        <select name="exit_resettype_${i}" id="exit-resettype-${i}" ${readonly ? 'disabled' : ''}>
                            ${doorResetName.map(d => `<option value="${d.number}" ${door.resetType===d.number?'selected':''}>${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="reverse-exit-section">
                        <button type="button" class="reverse-btn" data-index="${i}" ${readonly ? 'disabled' : ''}>${getReverseBtnLabel(room, i, options)}</button>
                    </div>
                </div>
            </div>`;
    });
    html += '</div>';
    el.innerHTML = html;
    
    // Render exit flags checkboxes for each door
    directions.forEach((dir, i) => {
        const door = room.doors[i];
        const flagsEl = el.querySelector(`#exit-flags-${i}`);
        if (flagsEl) {
            const flagsData = exitFlagsName.map(f => ({ value: f.value, label: f.label }));
            flagsEl.appendChild(createFlagGroup(`exit_flags_${i}`, flagsData, door.exitFlags, v => {
                door.exitFlags = v;
                // Update status
                const status = el.querySelector(`.exit-header[data-index="${i}"] .exit-status`);
                if (status) {
                    status.textContent = door.VNumTo !== -1 ? `→ #${door.VNumTo}` : 'No exit';
                }
                updateExitFlagsState(flagsEl, v);
                if (onChange) onChange(room);
            }, { columns: 3, disabled: readonly }).container);
            
            // Apply initial state
            updateExitFlagsState(flagsEl, door.exitFlags);
        }
    });
    
    // Toggle exit details
    el.querySelectorAll('.exit-header').forEach(header => {
        header.addEventListener('click', () => {
            const idx = header.dataset.index;
            const details = el.querySelector(`.exit-details[data-index="${idx}"]`);
            if (details) details.classList.toggle('expanded');
        });
    });
    
    // Change handlers
    if (!readonly) {
        el.querySelectorAll('input, select, textarea').forEach(inp => {
            inp.addEventListener('change', e => {
                // Name format: exit_fieldname_index (e.g., exit_vnumto_2)
                const parts = e.target.name.split('_');
                let field, idx;
                if (parts[0] === 'exit') {
                    field = parts[1];
                    idx = parseInt(parts[2], 10);
                } else {
                    field = parts[0];
                    idx = parseInt(parts[1], 10);
                }
                const door = room.doors[idx];
                
                if (!door) {
                    console.error(`[RoomForm] Door ${idx} not found. room.doors:`, room.doors, `room:`, room);
                    return;
                }
                
                if (field === 'vnumto') door.VNumTo = parseInt(e.target.value, 10) || -1;
                else if (field === 'keyvnum') door.keyVNum = parseInt(e.target.value, 10) || -1;
                else if (field === 'keywords') door.keywords = e.target.value;
                else if (field === 'descr') door.descr = e.target.value;
                else if (field === 'resettype') {
                    const v = parseInt(e.target.value, 10);
                    door.resetType = isNaN(v) ? -1 : v;
                }

                
                // Update status
                const status = el.querySelector(`.exit-status[data-index="${idx}"], .exit-header[data-index="${idx}"] .exit-status`);
                if (status && field === 'vnumto') {
                    status.textContent = door.VNumTo !== -1 ? `→ #${door.VNumTo}` : 'No exit';
                }
                
                if (onChange) onChange(room);
            });
        });
        
        // Reverse exit button handlers
        el.querySelectorAll('.reverse-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index, 10);
                const door = room.doors[idx];
                if (!door) return;
                if (door.VNumTo === -1) {
                    showToast('Set a destination VNum first', 'error');
                    return;
                }
                if (!options.area) return;
                const destRoom = getRoomByVNum(options.area.rooms, door.VNumTo);
                if (!destRoom) {
                    showToast(`Destination room #${door.VNumTo} not found`, 'error');
                    return;
                }
                const oppDir = REV_DIR[idx];
                if (!destRoom.doors[oppDir]) {
                    destRoom.doors[oppDir] = createDoor();
                }
                const oppDoor = destRoom.doors[oppDir];
                oppDoor.VNumTo = room.VNum;
                oppDoor.keywords = door.keywords;
                oppDoor.exitFlags = door.exitFlags;
                oppDoor.keyVNum = door.keyVNum;
                oppDoor.resetType = door.resetType;
                btn.textContent = getReverseBtnLabel(room, idx, options);
                showToast(`Reverse exit created in Room #${door.VNumTo} (${dirSimpleNameEn[oppDir]})`);
                if (onChange) onChange(room);
            });
        });
    }
}

function renderExtras(container, room, onChange, readonly) {
    const el = container.querySelector('#room-extras');
    if (!el) return;
    
    function renderList() {
        el.innerHTML = '';
        room.extraDescr.forEach((extra, i) => {
            const card = document.createElement('div');
            card.className = 'extra-card';
            card.innerHTML = `
                <div class="extra-card-header">
                    <input type="text" name="extra_kw_${i}" value="${escapeHtml(extra.keywords)}" placeholder="keywords" class="extra-keywords" ${readonly ? 'disabled' : ''}>
                    <button type="button" class="remove-extra-btn" data-index="${i}" ${readonly ? 'disabled' : ''}>×</button>
                </div>
                <textarea name="extra_descr_${i}" rows="3" placeholder="description..." class="extra-descr" ${readonly ? 'disabled' : ''}>${escapeHtml(extra.descr)}</textarea>`;
            el.appendChild(card);
        });
        
        // Wrap extra description textareas with column guide
        el.querySelectorAll('textarea[name^="extra_descr"]').forEach(ta => {
            wrapTextareaWithGuide(ta, 80);
        });
        
        if (!readonly) {
            el.querySelectorAll('input, textarea').forEach(inp => {
                inp.addEventListener('change', e => {
                    const parts = e.target.name.split('_');
                    const idx = parseInt(parts[2], 10);
                    if (parts[1] === 'kw') room.extraDescr[idx].keywords = e.target.value;
                    else room.extraDescr[idx].descr = e.target.value;
                    if (onChange) onChange(room);
                });
            });
            el.querySelectorAll('.remove-extra-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    const idx = parseInt(e.target.dataset.index, 10);
                    room.extraDescr.splice(idx, 1);
                    renderList();
                    if (onChange) onChange(room);
                });
            });
        }
    }
    
    renderList();
    
    const addBtn = container.querySelector('.add-extra-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            room.extraDescr.push({ keywords: '', descr: '' });
            renderList();
            if (onChange) onChange(room);
        });
    }
}

/**
 * Update exit flags checkbox states based on door/window logic:
 * - No flags: only EX_ISDOOR and EX_WINDOW enabled
 * - EX_ISDOOR checked: EX_WINDOW disabled, others enabled
 * - EX_WINDOW checked: all others disabled
 * Also enables/disables Reset State select based on EX_ISDOOR
 */
function updateExitFlagsState(container, exitFlags) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const isDoor = (exitFlags & EX_ISDOOR) !== 0;
    const isWindow = (exitFlags & EX_WINDOW) !== 0;
    
    checkboxes.forEach(cb => {
        const flagValue = parseInt(cb.value, 10);
        
        if (isWindow) {
            // EX_WINDOW checked: all others disabled
            cb.disabled = flagValue !== EX_WINDOW;
        } else if (isDoor) {
            // EX_ISDOOR checked: EX_WINDOW disabled, others enabled
            cb.disabled = flagValue === EX_WINDOW;
        } else {
            // No flags checked: only EX_ISDOOR and EX_WINDOW enabled
            cb.disabled = flagValue !== EX_ISDOOR && flagValue !== EX_WINDOW;
        }
    });
    
    // Enable/disable Reset State select based on EX_ISDOOR
    const match = container.id.match(/exit-flags-(\d+)/);
    if (match) {
        const idx = match[1];
        const resetSelect = container.closest('.exit-details')?.querySelector(`#exit-resettype-${idx}`);
        if (resetSelect) {
            resetSelect.disabled = !isDoor;
        }
    }
}

function renderContents(container, room, onChange, readonly, area) {
    const objsEl = container.querySelector('#room-objs');
    const mobsEl = container.querySelector('#room-mobs');
    
    if (objsEl) {
        let html = '';
        if (!readonly) {
            html += `<button type="button" class="add-content-btn" data-type="obj">+ Object</button>`;
        }
        
        if (room.objs.length === 0) {
            html += '<p class="empty-contents">No objects loaded in this room.</p>';
        } else {
            html += '<div class="contents-list">';
            room.objs.forEach((obj, i) => {
                const fullObj = area?.objs?.find(o => o.VNum === obj.VNum);
                const name = fullObj ? fullObj.shortDescr : '';
                html += `<div class="content-item" data-index="${i}">
                    <span class="content-vnum">Obj #${obj.VNum}</span>
                    <span class="content-name">${escapeHtml(name)}</span>
                    <span class="content-info">Limit: ${obj.limit}</span>
                    ${!readonly ? `<button type="button" class="edit-content-btn" title="Edit">✏️</button>
                    <button type="button" class="delete-content-btn" title="Delete">×</button>` : ''}
                </div>`;
            });
            html += '</div>';
        }
        
        html += '<div class="content-edit-form hidden"></div>';
        objsEl.innerHTML = html;
    }
    
    if (mobsEl) {
        let html = '';
        if (!readonly) {
            html += `<button type="button" class="add-content-btn" data-type="mob">+ Mobile</button>`;
        }
        
        if (room.mobs.length === 0) {
            html += '<p class="empty-contents">No mobiles loaded in this room.</p>';
        } else {
            html += '<div class="contents-list">';
            room.mobs.forEach((mob, i) => {
                const fullMob = area?.mobs?.find(m => m.VNum === mob.VNum);
                const name = fullMob ? fullMob.shortDescr : '';
                html += `<div class="content-item" data-index="${i}">
                    <span class="content-vnum">Mob #${mob.VNum}</span>
                    <span class="content-name">${escapeHtml(name)}</span>
                    <span class="content-info">Limit: ${mob.limit}</span>
                    ${!readonly ? `<button type="button" class="edit-content-btn" title="Edit">✏️</button>
                    <button type="button" class="delete-content-btn" title="Delete">×</button>` : ''}
                </div>`;
            });
            html += '</div>';
        }
        
        html += '<div class="content-edit-form hidden"></div>';
        mobsEl.innerHTML = html;
    }
    
    // Setup content event listeners
    if (!readonly) {
        setupContentEventListeners(container, room, onChange, area);
    }
}

function setupContentEventListeners(container, room, onChange, area) {
    // Add buttons
    container.querySelectorAll('.add-content-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            showAddContentForm(container, room, type, onChange, area);
        });
    });
    
    // Edit buttons
    container.querySelectorAll('.edit-content-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.content-item');
            const isObj = item.querySelector('.content-vnum')?.textContent.startsWith('Obj');
            showEditContentForm(container, room, item, isObj ? 'obj' : 'mob', onChange, area);
        });
    });
    
    // Delete buttons
    container.querySelectorAll('.delete-content-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.content-item');
            const index = parseInt(item.dataset.index, 10);
            const isObj = item.querySelector('.content-vnum')?.textContent.startsWith('Obj');
            
            if (isObj) {
                if (confirm('Remove this object from room?')) {
                    room.objs.splice(index, 1);
                }
            } else {
                if (confirm('Remove this mobile from room?')) {
                    room.mobs.splice(index, 1);
                }
            }
            
            renderContents(container, room, onChange, false, area);
            if (onChange) onChange(room);
        });
    });
}

function showAddContentForm(container, room, type, onChange, area) {
    const section = type === 'obj' ? container.querySelector('#room-objs') : container.querySelector('#room-mobs');
    const formEl = section.querySelector('.content-edit-form');
    if (!formEl) return;
    
    formEl.classList.remove('hidden');
    
    let fields = '';
    if (type === 'obj') {
        fields = `<label>Object <select name="objVnum">${area?.objs?.map(o => `<option value="${o.VNum}">#${o.VNum} ${escapeHtml(o.shortDescr)}</option>`).join('') || ''}</select></label>
            <label>Limit <input type="number" name="limit" value="1" min="1"></label>`;
    } else {
        fields = `<label>Mobile <select name="mobVnum">${area?.mobs?.map(m => `<option value="${m.VNum}">#${m.VNum} ${escapeHtml(m.shortDescr)}</option>`).join('') || ''}</select></label>
            <label>Limit <input type="number" name="limit" value="1" min="1"></label>`;
    }
    
    formEl.innerHTML = `<div class="reset-form"><h4>Add ${type === 'obj' ? 'Object' : 'Mobile'}</h4>${fields}
        <div class="reset-form-actions"><button type="button" class="reset-save-btn">Save</button><button type="button" class="reset-cancel-btn">Cancel</button></div></div>`;
    
    formEl.querySelector('.reset-save-btn').addEventListener('click', () => {
        if (type === 'obj') {
            const obj = createLoadedObject();
            obj.VNum = parseInt(formEl.querySelector('[name="objVnum"]').value, 10);
            obj.limit = Math.max(1, parseInt(formEl.querySelector('[name="limit"]').value, 10));
            room.objs.push(obj);
        } else {
            const mob = createLoadedMob();
            mob.VNum = parseInt(formEl.querySelector('[name="mobVnum"]').value, 10);
            mob.limit = Math.max(1, parseInt(formEl.querySelector('[name="limit"]').value, 10));
            room.mobs.push(mob);
        }
        renderContents(container, room, onChange, false, area);
        if (onChange) onChange(room);
    });
    
    formEl.querySelector('.reset-cancel-btn').addEventListener('click', () => formEl.classList.add('hidden'));
}

function showEditContentForm(container, room, item, type, onChange, area) {
    const section = type === 'obj' ? container.querySelector('#room-objs') : container.querySelector('#room-mobs');
    const formEl = section.querySelector('.content-edit-form');
    if (!formEl) return;
    
    const index = parseInt(item.dataset.index, 10);
    const data = type === 'obj' ? room.objs[index] : room.mobs[index];
    if (!data) return;
    
    formEl.classList.remove('hidden');
    
    let fields = '';
    if (type === 'obj') {
        fields = `<label>Object <select name="objVnum">${area?.objs?.map(o => `<option value="${o.VNum}" ${o.VNum === data.VNum ? 'selected' : ''}>#${o.VNum} ${escapeHtml(o.shortDescr)}</option>`).join('') || ''}</select></label>
            <label>Limit <input type="number" name="limit" value="${data.limit}" min="1"></label>`;
    } else {
        fields = `<label>Mobile <select name="mobVnum">${area?.mobs?.map(m => `<option value="${m.VNum}" ${m.VNum === data.VNum ? 'selected' : ''}>#${m.VNum} ${escapeHtml(m.shortDescr)}</option>`).join('') || ''}</select></label>
            <label>Limit <input type="number" name="limit" value="${data.limit}" min="1"></label>`;
    }
    
    formEl.innerHTML = `<div class="reset-form"><h4>Edit ${type === 'obj' ? 'Object' : 'Mobile'}</h4>${fields}
        <div class="reset-form-actions"><button type="button" class="reset-save-btn">Save</button><button type="button" class="reset-cancel-btn">Cancel</button></div></div>`;
    
    formEl.querySelector('.reset-save-btn').addEventListener('click', () => {
        data.VNum = parseInt(formEl.querySelector('[name="objVnum"], [name="mobVnum"]').value, 10);
        data.limit = Math.max(1, parseInt(formEl.querySelector('[name="limit"]').value, 10));
        renderContents(container, room, onChange, false, area);
        if (onChange) onChange(room);
    });
    
    formEl.querySelector('.reset-cancel-btn').addEventListener('click', () => formEl.classList.add('hidden'));
}



function attachChangeHandlers(container, room, onChange) {
    container.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
        if (input.name.startsWith('exit_') || input.name.startsWith('extra_')) return;
        input.addEventListener('change', e => {
            let value = e.target.value;
            if (e.target.type === 'checkbox') {
                room[e.target.name] = e.target.checked ? 1 : 0;
            } else if (['sectorType', 'resetOnly'].includes(e.target.name)) {
                room[e.target.name] = parseInt(value, 10) || 0;
            } else {
                room[e.target.name] = value;
            }
            if (e.target.name === 'name') {
                const h = container.querySelector('.form-header h3');
                if (h) h.textContent = value ? `#${room.VNum} - ${value}` : `#${room.VNum}`;
            }
            if (onChange) onChange(room);
        });
    });
}

