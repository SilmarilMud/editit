/* specials-panel.js - Specials panel editor for EditIt */

import { mobSpecFuncs, objSpecFuncs } from './constants.js';
import { esc } from './utils.js';

let currentArea = null;
let onChangeCallback = null;

/**
 * Render specials panel
 * @param {Object} area - Area data
 * @param {Function} onChange - Callback when changes are made
 * @returns {HTMLElement}
 */
export function renderSpecialsPanel(area, onChange) {
    currentArea = area;
    onChangeCallback = onChange;
    
    const container = document.createElement('div');
    container.className = 'specials-panel form-entity';
    
    container.innerHTML = `
        <div class="form-header">
            <h3>Specials</h3>
            <small>Special procedures assigned to mobiles. Edit in the Mobiles section or click to change here.</small>
        </div>
        <div id="specials-list"></div>
    `;
    
    renderSpecialsList(container);
    setupEventListeners(container);
    return container;
}

/**
 * Render the list of specials
 */
function renderSpecialsList(container) {
    const el = container.querySelector('#specials-list');
    if (!el) return;
    
    // Get all mobs and objs with specials
    const mobsWithSpecials = currentArea.mobs.filter(m => m.special && m.special !== '');
    const objsWithSpecials = currentArea.objs.filter(o => o.special && o.special !== '');
    
    if (mobsWithSpecials.length === 0 && objsWithSpecials.length === 0) {
        el.innerHTML = '<p class="empty-contents">No specials assigned.</p>';
        return;
    }
    
    let html = '<div class="specials-list">';
    
    for (const mob of mobsWithSpecials) {
        html += `
            <div class="special-item" data-type="M" data-vnum="${mob.VNum}">
                <div class="special-info">
                    <span class="special-vnum">#${mob.VNum}</span>
                    <span class="special-name">${esc(mob.shortDescr)}</span>
                    <span class="special-func">${esc(mob.special)}</span>
                </div>
                <div class="special-actions">
                    <button type="button" class="edit-special-btn" title="Edit">✏️</button>
                    <button type="button" class="remove-special-btn" title="Remove">×</button>
                </div>
            </div>
        `;
    }
    
    for (const obj of objsWithSpecials) {
        html += `
            <div class="special-item" data-type="O" data-vnum="${obj.VNum}">
                <div class="special-info">
                    <span class="special-vnum">#${obj.VNum}</span>
                    <span class="special-name">${esc(obj.shortDescr)}</span>
                    <span class="special-func">${esc(obj.special)}</span>
                </div>
                <div class="special-actions">
                    <button type="button" class="edit-special-btn" title="Edit">✏️</button>
                    <button type="button" class="remove-special-btn" title="Remove">×</button>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    html += '<div class="special-edit-form hidden"></div>';
    
    el.innerHTML = html;
}

/**
 * Setup event listeners
 */
function setupEventListeners(container) {
    container.addEventListener('click', e => {
        // Edit button
        if (e.target.classList.contains('edit-special-btn')) {
            const item = e.target.closest('.special-item');
            if (item) {
                showEditForm(container, item);
            }
        }
        
        // Remove button
        if (e.target.classList.contains('remove-special-btn')) {
            const item = e.target.closest('.special-item');
            if (item) {
                const type = item.dataset.type;
                const vnum = parseInt(item.dataset.vnum, 10);
                const entity = type === 'M'
                    ? currentArea.mobs.find(m => m.VNum === vnum)
                    : currentArea.objs.find(o => o.VNum === vnum);
                if (entity && confirm(`Remove special from #${vnum} ${entity.shortDescr}?`)) {
                    entity.special = '';
                    renderSpecialsList(container);
                    if (onChangeCallback) onChangeCallback(entity);
                }
            }
        }
    });
}

/**
 * Show edit form for a special
 */
function showEditForm(container, item) {
    const type = item.dataset.type;
    const vnum = parseInt(item.dataset.vnum, 10);
    const entity = type === 'M'
        ? currentArea.mobs.find(m => m.VNum === vnum)
        : currentArea.objs.find(o => o.VNum === vnum);
    if (!entity) return;
    
    const formEl = container.querySelector('.special-edit-form');
    if (!formEl) return;
    
    formEl.classList.remove('hidden');
    
    const specOpts = (type === 'M' ? mobSpecFuncs : objSpecFuncs)
        .filter(s => s !== '')
        .map(s => `<option value="${s}" ${entity.special === s ? 'selected' : ''}>${s}</option>`)
        .join('');
    
    formEl.innerHTML = `
        <div class="reset-form">
            <h4>Edit Special for #${vnum} ${esc(entity.shortDescr)}</h4>
            <label>Special Function
                <select name="special">${specOpts}</select>
            </label>
            <div class="reset-form-actions">
                <button type="button" class="reset-save-btn">Save</button>
                <button type="button" class="reset-cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    
    formEl.querySelector('.reset-save-btn').addEventListener('click', () => {
        entity.special = formEl.querySelector('[name="special"]').value;
        formEl.classList.add('hidden');
        renderSpecialsList(container);
        if (onChangeCallback) onChangeCallback(entity);
    });
    
    formEl.querySelector('.reset-cancel-btn').addEventListener('click', () => {
        formEl.classList.add('hidden');
    });
}

