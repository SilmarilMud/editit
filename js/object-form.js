/* object-form.js - Object editor form for EditIt */

import {
    ITEM_ARMOR, VALUE_IS_UNUSED, VALUE_IS_SPELL, VALUE_IS_WEAPON,
    VALUE_IS_NUMBER_FROM_0, VALUE_IS_CONTAINER_FLAGS, VALUE_IS_LIQUID, VALUE_IS_POISON,
    VALUE_IS_VNUM, VALUE_IS_FURNITURE_FLAGS, VALUE_IS_TRAPTYPE, VALUE_IS_TRAPDAMAGE,
    ITEM_WAND, ITEM_STAFF, ITEM_INSTRUMENT, ITEM_WARSOUND, ITEM_TRAP,
    ITEM_DONT_SET, AFF_OBJ_DONT_SET, EQUIPPABLE_TYPES,
    itemTypeName, itemExtraFlagsName, itemWearFlagsName, applyName,
    itemValues, itemWeaponName, itemContainerFlagsName, itemLiquidName,
    itemPoisonName, itemFurnitureFlagsName, itemTrapType, itemTrapDamage,
    spells, objSpecFuncs, wearAffsData
} from './constants.js';
import { createFlagGroup } from './flags.js';
import { escapeHtml, wrapTextareaWithGuide, setupTabs } from './utils.js';

/**
 * Check if object type uses the action text field
 * @param {number} type - Object type
 * @returns {boolean}
 */
function ObjTypeUsesAction(type) {
    return type === ITEM_WARSOUND;
}

export function renderObjectForm(obj, onChange, options = {}) {
    const { readonly = false } = options;
    
    const container = document.createElement('div');
    container.className = 'object-form form-entity';
    
    container.innerHTML = `
        <div class="form-header">
            <h3>#${obj.VNum}${obj.shortDescr ? ' - ' + escapeHtml(obj.shortDescr) : ''}</h3>
        </div>
        <div class="form-tabs">
            <button type="button" class="form-tab-btn active" data-tab="basic">Basic</button>
            <button type="button" class="form-tab-btn" data-tab="values">Values</button>
            <button type="button" class="form-tab-btn" data-tab="flags">Flags</button>
            <button type="button" class="form-tab-btn" data-tab="applies">Applies</button>
            <button type="button" class="form-tab-btn" data-tab="extras">Extras</button>
        </div>
        <div class="form-tab-content active" data-tab="basic">
            <div class="form-section">
                <label>Keywords <span class="hint">(space-separated)</span></label>
                <input type="text" name="keywords" value="${escapeHtml(obj.keywords)}" ${readonly ? 'disabled' : ''}>
            </div>
            <div class="form-section">
                <label>Short Description <span class="hint">(shown in equip/inventory)</span></label>
                <input type="text" name="shortDescr" value="${escapeHtml(obj.shortDescr)}" ${readonly ? 'disabled' : ''}>
            </div>
            <div class="form-section">
                <label>Long Description <span class="hint">(shown in room)</span></label>
                <input type="text" name="longDescr" value="${escapeHtml(obj.longDescr)}" ${readonly ? 'disabled' : ''}>
            </div>
            <div class="form-row">
                <div class="form-section">
                    <label>Object Type</label>
                    <select name="type" ${readonly ? 'disabled' : ''}>
                        ${itemTypeName.map(t => `<option value="${t.number}" ${obj.type === t.number ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-section">
                    <label>Special Function</label>
                    <div class="select-with-info">
                        <select name="special" ${readonly ? 'disabled' : ''}>
                            ${objSpecFuncs.map(s => `<option value="${s.value}" ${(obj.special === s.value) ? 'selected' : ''} data-desc="${(s.desc || '').replace(/"/g, '&quot;')}" title="${(s.desc || '').replace(/"/g, '&quot;')}">${s.label}</option>`).join('')}
                        </select>
                        <span class="info-icon-wrap"><span class="info-icon" tabindex="0">ⓘ</span></span>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-section">
                    <label>Weight</label>
                    <input type="number" name="weight" value="${obj.weight}" min="0" ${readonly ? 'disabled' : ''}>
                </div>
                <div class="form-section">
                    <label>Cost</label>
                    <input type="number" name="cost" value="${obj.cost}" min="0" ${readonly ? 'disabled' : ''}>
                </div>
            </div>
            <div class="form-section">
                <label>Action Description <span class="hint">(play/activate) (optional)</span></label>
                <input type="text" name="action" value="${escapeHtml(obj.action)}" ${readonly ? 'disabled' : ''}>
            </div>
            <div class="form-section">
                <label>Wear Message (on) <span class="hint">(optional)</span></label>
                <input type="text" name="wearOnMsg" value="${escapeHtml(obj.wearOnMsg)}" ${readonly ? 'disabled' : ''}>
            </div>
            <div class="form-section">
                <label>Wear Message (off) <span class="hint">(optional)</span></label>
                <input type="text" name="wearOffMsg" value="${escapeHtml(obj.wearOffMsg)}" ${readonly ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-tab-content" data-tab="values">
            <div class="form-section"><h4>Object Values</h4><div id="obj-values"></div></div>
        </div>
        <div class="form-tab-content" data-tab="flags">
            <div class="form-section"><h4>Extra Flags</h4><div id="obj-extraflags"></div></div>
            <div class="form-section"><h4>Wear Flags</h4><div id="obj-wearflags"></div></div>
            <div class="form-section"><h4>Worn Afflictions</h4><div id="obj-wearaffs"></div></div>
        </div>
        <div class="form-tab-content" data-tab="applies">
            <div class="form-section"><h4>Apply Modifiers</h4><div id="obj-applies"></div>
                <button type="button" class="add-apply-btn" ${readonly ? 'disabled' : ''}>+ Add Apply</button>
            </div>
        </div>
        <div class="form-tab-content" data-tab="extras">
            <div class="form-section"><h4>Extra Descriptions</h4><div id="obj-extras"></div>
                <button type="button" class="add-extra-btn" ${readonly ? 'disabled' : ''}>+ Add Extra</button>
            </div>
        </div>
    `;
    
    renderValues(container, obj, onChange, readonly);
    renderFlags(container, obj, onChange, readonly);
    renderApplies(container, obj, onChange, readonly);
    renderExtras(container, obj, onChange, readonly);
    setupTabs(container);
    
    // Wrap description textareas with column guide

    // Note: extra_descr textareas are wrapped in renderExtras > renderList
    
    if (!readonly) attachChangeHandlers(container, obj, onChange, readonly);
    
    return container;
}

function renderValues(container, obj, onChange, readonly) {
    const el = container.querySelector('#obj-values');
    if (!el) return;
    const info = itemValues.find(v => v.itemType === obj.type) || { descr: ['','','',''], type: [0,0,0,0], hint: ['','','',''] };
    
    let html = '';
    for (let i = 0; i < 4; i++) {
        const labelText = info.descr[i] || `Value ${i+1}`;
        const hint = info.hint && info.hint[i] ? ` <span class="hint">(${info.hint[i]})</span>` : '';
        const label = `${labelText}${hint}`;
        const t = info.type[i];
        let input = '';
        
        if (t === VALUE_IS_UNUSED) {
            input = `<input type="number" name="value_${i}" value="${obj.value[i]}" disabled>`;
        } else if (t === VALUE_IS_SPELL) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}><option value="0">-- None --</option>${spells.slice(1).map((s,idx) => `<option value="${idx+1}" ${obj.value[i]===idx+1?'selected':''}>${s}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_WEAPON) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemWeaponName.map(w => `<option value="${w.number}" ${obj.value[i]===w.number?'selected':''}>${w.name}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_CONTAINER_FLAGS) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemContainerFlagsName.map(f => `<option value="${f.number}" ${obj.value[i]===f.number?'selected':''}>${f.name}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_LIQUID) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemLiquidName.map(l => `<option value="${l.number}" ${obj.value[i]===l.number?'selected':''}>${l.name}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_POISON) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemPoisonName.map(p => `<option value="${p.number}" ${obj.value[i]===p.number?'selected':''}>${p.name}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_FURNITURE_FLAGS) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemFurnitureFlagsName.map(f => `<option value="${f.number}" ${obj.value[i]===f.number?'selected':''}>${f.name}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_TRAPTYPE) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemTrapType.map(tr => `<option value="${tr.number}" ${obj.value[i]===tr.number?'selected':''}>${tr.name}</option>`).join('')}</select>`;
        } else if (t === VALUE_IS_TRAPDAMAGE) {
            input = `<select name="value_${i}" ${readonly ? 'disabled' : ''}>${itemTrapDamage.map(d => `<option value="${d.number}" ${obj.value[i]===d.number?'selected':''}>${d.name}</option>`).join('')}</select>`;
        } else {
            const min = (t === VALUE_IS_NUMBER_FROM_0 || t === VALUE_IS_VNUM) ? 0 : -99999;
            input = `<input type="number" name="value_${i}" value="${obj.value[i]}" min="${min}" ${readonly ? 'disabled' : ''}>`;
        }
        html += `<div class="form-section"><label>${label}</label>${input}</div>`;
    }
    el.innerHTML = html;
    
    if (!readonly) {
        el.querySelectorAll('input, select').forEach(inp => {
            inp.addEventListener('change', e => {
                const idx = parseInt(e.target.name.split('_')[1], 10);
                obj.value[idx] = parseInt(e.target.value, 10) || 0;
                if (onChange) onChange(obj);
            });
        });
    }
}

function renderFlags(container, obj, onChange, readonly) {
    const extraEl = container.querySelector('#obj-extraflags');
    if (extraEl) {
        extraEl.appendChild(createFlagGroup('extraFlags', itemExtraFlagsName, obj.extraFlags, v => { obj.extraFlags = v; if (onChange) onChange(obj); }, { columns: 3, disabled: readonly, exclude: ITEM_DONT_SET }).container);
    }
    const wearEl = container.querySelector('#obj-wearflags');
    if (wearEl) {
        wearEl.appendChild(createFlagGroup('wearFlags', itemWearFlagsName, obj.wearFlags, v => { obj.wearFlags = v; if (onChange) onChange(obj); }, { columns: 3, disabled: readonly }).container);
    }
    const affsEl = container.querySelector('#obj-wearaffs');
    if (affsEl) {
        affsEl.appendChild(createFlagGroup('wearAffs', wearAffsData, obj.wearAffs, v => { obj.wearAffs = v; if (onChange) onChange(obj); }, { columns: 3, disabled: readonly, exclude: AFF_OBJ_DONT_SET }).container);
    }
}

function renderApplies(container, obj, onChange, readonly) {
    const el = container.querySelector('#obj-applies');
    if (!el) return;
    
    function renderList() {
        el.innerHTML = '';
        obj.applyType.forEach((apply, i) => {
            const row = document.createElement('div');
            row.className = 'apply-row';
            row.innerHTML = `
                <select name="apply_type_${i}" class="apply-type" ${readonly ? 'disabled' : ''}>${applyName.map(a => `<option value="${a.number}" ${apply.type===a.number?'selected':''}>${a.name}</option>`).join('')}</select>
                <input type="number" name="apply_value_${i}" class="apply-value" value="${apply.value}" ${readonly ? 'disabled' : ''}>
                <button type="button" class="remove-apply-btn" data-index="${i}" ${readonly ? 'disabled' : ''}>×</button>`;
            el.appendChild(row);
        });
        
        if (!readonly) {
            el.querySelectorAll('select, input').forEach(inp => {
                inp.addEventListener('change', e => {
                    const parts = e.target.name.split('_');
                    const idx = parseInt(parts[2], 10);
                    if (parts[1] === 'type') obj.applyType[idx].type = parseInt(e.target.value, 10) || 0;
                    else obj.applyType[idx].value = parseInt(e.target.value, 10) || 0;
                    if (onChange) onChange(obj);
                });
            });
            el.querySelectorAll('.remove-apply-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    const idx = parseInt(e.target.dataset.index, 10);
                    obj.applyType.splice(idx, 1);
                    renderList();
                    if (onChange) onChange(obj);
                });
            });
        }
    }
    
    renderList();
    
    const addBtn = container.querySelector('.add-apply-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            obj.applyType.push({ type: 0, value: 0 });
            renderList();
            if (onChange) onChange(obj);
        });
    }
}

function renderExtras(container, obj, onChange, readonly) {
    const el = container.querySelector('#obj-extras');
    if (!el) return;
    
    function renderList() {
        el.innerHTML = '';
        obj.extraDescr.forEach((extra, i) => {
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
            wrapTextareaWithGuide(ta);
        });
        
        if (!readonly) {
            el.querySelectorAll('input, textarea').forEach(inp => {
                inp.addEventListener('change', e => {
                    const parts = e.target.name.split('_');
                    const idx = parseInt(parts[2], 10);
                    if (parts[1] === 'kw') obj.extraDescr[idx].keywords = e.target.value;
                    else obj.extraDescr[idx].descr = e.target.value;
                    if (onChange) onChange(obj);
                });
            });
            el.querySelectorAll('.remove-extra-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    const idx = parseInt(e.target.dataset.index, 10);
                    obj.extraDescr.splice(idx, 1);
                    renderList();
                    if (onChange) onChange(obj);
                });
            });
        }
    }
    
    renderList();
    
    const addBtn = container.querySelector('.add-extra-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            obj.extraDescr.push({ keywords: '', descr: '' });
            renderList();
            if (onChange) onChange(obj);
        });
    }
}



/**
 * Update field states based on object type
 * @param {HTMLElement} container
 * @param {Object} obj
 */
function updateFieldStates(container, obj) {
    const actionField = container.querySelector('[name="action"]');
    if (actionField) {
        actionField.disabled = !ObjTypeUsesAction(obj.type);
    }

    const isEquippable = EQUIPPABLE_TYPES.includes(obj.type);
    const wearOnField = container.querySelector('[name="wearOnMsg"]');
    const wearOffField = container.querySelector('[name="wearOffMsg"]');
    if (wearOnField) wearOnField.disabled = !isEquippable;
    if (wearOffField) wearOffField.disabled = !isEquippable;
}

function attachChangeHandlers(container, obj, onChange, readonly) {
    // Initial state update
    updateFieldStates(container, obj);
    
    container.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
        if (input.name.startsWith('value_') || input.name.startsWith('apply_') || input.name.startsWith('extra_')) return;
        input.addEventListener('change', e => {
            let value = e.target.value;
            if (['type', 'weight', 'cost'].includes(e.target.name)) value = parseInt(value, 10) || 0;
            obj[e.target.name] = value;
            if (e.target.name === 'shortDescr') {
                const h = container.querySelector('.form-header h3');
                if (h) h.textContent = value ? `#${obj.VNum} - ${value}` : `#${obj.VNum}`;
            }
            // Update field states when type changes
            if (e.target.name === 'type') {
                // Apply defaults for the new type
                const info = itemValues.find(v => v.itemType === obj.type);
                if (info && info.defaults) {
                    obj.value = [...info.defaults];
                }
                updateFieldStates(container, obj);
                renderValues(container, obj, onChange, readonly);
            }
            if (onChange) onChange(obj);
        });
    });
}

