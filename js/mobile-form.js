/* mobile-form.js - Mobile (NPC) editor form for EditIt */

import {
    ACT_DONT_SET, AFF_MOB_DONT_SET,
    sexName, races, guildName, mobSpecFuncs, itemTypeName,
    actFlagsData, affFlagsData
} from './constants.js';
import { createFlagGroup } from './flags.js';
import { showToast, escapeHtml, wrapTextareaWithGuide, setupTabs } from './utils.js';

/**
 * Render mobile form
 * @param {Object} mob - Mobile entity
 * @param {Function} onChange - Callback when form changes: (mob) => void
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function renderMobileForm(mob, onChange, options = {}) {
    const { readonly = false } = options;
    
    const container = document.createElement('div');
    container.className = 'mobile-form form-entity';
    
    container.innerHTML = `
        <div class="form-header">
            <h3>#${mob.VNum}${mob.shortDescr ? ' - ' + escapeHtml(mob.shortDescr) : ''}</h3>
        </div>
        
        <div class="form-tabs">
            <button type="button" class="form-tab-btn active" data-tab="basic">Basic</button>
            <button type="button" class="form-tab-btn" data-tab="combat">Combat</button>
            <button type="button" class="form-tab-btn" data-tab="flags">Flags</button>
            <button type="button" class="form-tab-btn" data-tab="shop">Shop</button>
        </div>
        
        <div class="form-tab-content active" data-tab="basic">
            <div class="form-section">
                <label>Keywords <span class="hint">(space-separated)</span></label>
                <input type="text" name="keywords" value="${escapeHtml(mob.keywords)}" 
                       placeholder="keyword1 keyword2"
                       ${readonly ? 'disabled' : ''}>
            </div>
            
            <div class="form-section">
                <label>Short Description <span class="hint">(shown during actions)</span></label>
                <input type="text" name="shortDescr" value="${escapeHtml(mob.shortDescr)}"
                       placeholder="a shopkeeper"
                       ${readonly ? 'disabled' : ''}>
            </div>
            
            <div class="form-section">
                <label>Long Description <span class="hint">(shown in room)</span></label>
                <textarea name="longDescr" rows="6"
                          placeholder="A shopkeeper stands here."
                          ${readonly ? 'disabled' : ''}>${escapeHtml(mob.longDescr)}</textarea>
            </div>
            
            <div class="form-section">
                <label>Description <span class="hint">(shown when examined)</span></label>
                <textarea name="descr" rows="6"
                          placeholder="Detailed description when examining..."
                          ${readonly ? 'disabled' : ''}>${escapeHtml(mob.descr)}</textarea>
            </div>
            
            <div class="form-section">
                <label>Race</label>
                <select name="race" ${readonly ? 'disabled' : ''}>
                    <option value="">-- Select Race --</option>
                    ${races.map(r => `<option value="${r.english}" ${mob.race === r.english ? 'selected' : ''}>${r.italian}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-section">
                <label>Sex</label>
                <select name="sex" ${readonly ? 'disabled' : ''}>
                    ${sexName.map(s => `<option value="${s.number}" ${mob.sex === s.number ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-section">
                <label>Special Function</label>
                <select name="special" ${readonly ? 'disabled' : ''}>
                    ${mobSpecFuncs.map(s => `<option value="${s.value}" ${(mob.special === s.value) ? 'selected' : ''} title="${s.desc || ''}">${s.label}</option>`).join('')}
                </select>
            </div>
        </div>
        
        <div class="form-tab-content" data-tab="combat">
            <div class="form-row">
                <div class="form-section">
                    <label>Level <span class="hint">(1 - 100)</span></label>
                    <input type="number" name="level" value="${mob.level}" 
                           min="1" max="100"
                           ${readonly ? 'disabled' : ''}>
                </div>
                
                <div class="form-section">
                    <label>Alignment <span class="hint">(-1000 - 1000)</span></label>
                    <input type="number" name="align" value="${mob.align}" 
                           min="-1000" max="1000"
                           ${readonly ? 'disabled' : ''}>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-section">
                    <label>Gold</label>
                    <input type="number" name="gold" value="${mob.gold}" 
                           min="0"
                           ${readonly ? 'disabled' : ''}>
                </div>
                
                <div class="form-section">
                    <label>Reputation <span class="hint">(-1000 - 1000)</span></label>
                    <input type="number" name="reputation" value="${mob.reputation}" 
                           min="-1000" max="1000"
                           ${readonly ? 'disabled' : ''}>
                </div>
            </div>
            
            <div class="form-section">
                <label>Class</label>
                <select name="guild" ${readonly ? 'disabled' : ''}>
                    ${guildName.map(g => `<option value="${g.number}" ${mob.guild === g.number ? 'selected' : ''}>${g.name}</option>`).join('')}
                </select>
            </div>
        </div>
        
        <div class="form-tab-content" data-tab="flags">
            <div class="form-section">
                <h4>Action Flags</h4>
                <div id="mob-actflags"></div>
            </div>
            
            <div class="form-section">
                <h4>Affect Flags</h4>
                <div id="mob-affflags"></div>
            </div>
        </div>
        
        <div class="form-tab-content" data-tab="shop">
            <div class="form-section">
                <label>
                    <input type="checkbox" name="isShopKeeper" ${mob.isShopKeeper ? 'checked' : ''}
                           ${readonly ? 'disabled' : ''}>
                    Is Shop Keeper
                </label>
            </div>
            
            <div id="shop-settings" class="${mob.isShopKeeper ? '' : 'hidden'}">
                <div class="form-section">
                    <h4>Trade Types</h4>
                    <div class="form-row">
                        ${mob.buyType.map((bt, i) => `
                            <div class="form-section">
                                <label>Slot ${i + 1}</label>
                                <select name="buyType_${i}" ${readonly ? 'disabled' : ''}>
                                    <option value="0">-- None --</option>
                                    ${itemTypeName.map(item => `<option value="${item.number}" ${bt === item.number ? 'selected' : ''}>${item.name}</option>`).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-section">
                        <label>Profit Buy (%) <span class="hint">(10 - 200)</span></label>
                        <input type="number" name="profitBuy" value="${mob.profitBuy}" 
                               min="10" max="200"
                               ${readonly ? 'disabled' : ''}>
                    </div>
                    
                    <div class="form-section">
                        <label>Profit Sell (%) <span class="hint">(10 - 200)</span></label>
                        <input type="number" name="profitSell" value="${mob.profitSell}" 
                               min="10" max="200"
                               ${readonly ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-section">
                        <label>Open Hour <span class="hint">(0 - 23)</span></label>
                        <input type="number" name="openHour" value="${mob.openHour}" 
                               min="0" max="23"
                               ${readonly ? 'disabled' : ''}>
                    </div>
                    
                    <div class="form-section">
                        <label>Close Hour <span class="hint">(0 - 23)</span></label>
                        <input type="number" name="closeHour" value="${mob.closeHour}" 
                               min="0" max="23"
                               ${readonly ? 'disabled' : ''}>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add flag groups
    const actContainer = container.querySelector('#mob-actflags');
    if (actContainer) {
        const flagGroup = createFlagGroup('actFlags', actFlagsData, mob.actFlags, (val) => {
            mob.actFlags = val;
            if (onChange) onChange(mob);
        }, { columns: 3, disabled: readonly, exclude: ACT_DONT_SET });
        actContainer.appendChild(flagGroup.container);
    }
    
    const affContainer = container.querySelector('#mob-affflags');
    if (affContainer) {
        const flagGroup = createFlagGroup('affFlags', affFlagsData, mob.affFlags, (val) => {
            mob.affFlags = val;
            if (onChange) onChange(mob);
        }, { columns: 3, disabled: readonly, exclude: AFF_MOB_DONT_SET });
        affContainer.appendChild(flagGroup.container);
    }
    
    // Setup tab switching
    setupTabs(container);
    
    // Wrap description textareas with column guide
    container.querySelectorAll('textarea[name="longDescr"]').forEach(ta => {
        wrapTextareaWithGuide(ta);
    });
    container.querySelectorAll('textarea[name="descr"]').forEach(ta => {
        wrapTextareaWithGuide(ta);
    });
    
    // Attach change handlers
    if (!readonly) {
        attachChangeHandlers(container, mob, onChange);
    }
    
    return container;
}

/**
 * Setup tab switching
 * @param {HTMLElement} container
 */


/**
 * Attach change handlers
 * @param {HTMLElement} container
 * @param {Object} mob
 * @param {Function} onChange
 */
function attachChangeHandlers(container, mob, onChange) {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Skip flag containers
        if (input.closest('#mob-actflags') || input.closest('#mob-affflags')) return;
        
        // Validation rules: { min, max, warning }
        const validationRules = {
            align: { min: -1000, max: 1000, warning: 'Alignment must be between -1000 and 1000' },
            level: { min: 1, max: 100, warning: 'Level must be between 0 and 100' },
            reputation: { min: -1000, max: 1000, warning: 'Reputation must be between -1000 and 1000' },
            openHour: { min: 0, max: 23, warning: 'Hour must be between 0 and 23' },
            closeHour: { min: 0, max: 23, warning: 'Hour must be between 0 and 23' },
            profitBuy: { min: 10, max: 200, warning: 'Profit buy must be between 10 and 200' },
            profitSell: { min: 10, max: 200, warning: 'Profit sell must be between 10 and 200' },
        };
        
        // Add blur validation for number fields
        if (input.type === 'number' && validationRules[input.name]) {
            input.addEventListener('blur', () => {
                const rule = validationRules[input.name];
                let val = parseInt(input.value, 10) || 0;
                if (val < rule.min || val > rule.max) {
                    showToast(`${rule.warning} (value: ${val})`, 'warning');
                    val = Math.max(rule.min, Math.min(rule.max, val));
                    input.value = val;
                    mob[input.name] = val;
                    if (onChange) onChange(mob);
                }
            });
        }
        
        const handler = (e) => {
            const field = e.target.name;
            let value = e.target.value;
            
            // Handle checkbox
            if (e.target.type === 'checkbox') {
                if (field === 'isShopKeeper') {
                    mob.isShopKeeper = e.target.checked ? 1 : 0;
                    const shopSettings = container.querySelector('#shop-settings');
                    if (shopSettings) {
                        shopSettings.classList.toggle('hidden', !e.target.checked);
                    }
                }
                if (onChange) onChange(mob);
                return;
            }
            
            // Parse number fields
            if (['level', 'align', 'gold', 'reputation', 'guild', 'sex',
                 'profitBuy', 'profitSell', 'openHour', 'closeHour'].includes(field)) {
                value = parseInt(value, 10) || 0;
            }
            
            // Handle buyType arrays
            if (field.startsWith('buyType_')) {
                const idx = parseInt(field.split('_')[1], 10);
                mob.buyType[idx] = parseInt(value, 10) || 0;
                if (onChange) onChange(mob);
                return;
            }
            
            // Update mob
            mob[field] = value;
            
            // Update header
            if (field === 'shortDescr') {
                const header = container.querySelector('.form-header h3');
                if (header) {
                    header.textContent = value ? `#${mob.VNum} - ${value}` : `#${mob.VNum}`;
                }
            }
            
            if (onChange) onChange(mob);
        };
        
        input.addEventListener('change', handler);
        input.addEventListener('input', handler);
    });
}
