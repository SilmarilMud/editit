/* shop-form.js - Shop editor form for EditIt */

import { itemTypeName } from './constants.js';
import { esc } from './utils.js';

/**
 * Render shop form
 * @param {Object} mob - Mobile entity (with shop data)
 * @param {Function} onChange - Callback when form changes: (mob) => void
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function renderShopForm(mob, onChange, options = {}) {
    const { readonly = false, mobs = [] } = options;
    
    const container = document.createElement('div');
    container.className = 'shop-form form-entity';
    
    container.innerHTML = `
        <div class="form-header">
            <h3>#${mob.VNum} - ${esc(mob.shortDescr)} (Shop)</h3>
        </div>
        
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
                <label>Profit Buy (%)
                    <input type="number" name="profitBuy" value="${mob.profitBuy}" 
                           min="1" max="1000000"
                           ${readonly ? 'disabled' : ''}>
                </label>
                <small>Multiplier when buying from players</small>
            </div>
            
            <div class="form-section">
                <label>Profit Sell (%)
                    <input type="number" name="profitSell" value="${mob.profitSell}" 
                           min="1" max="1000000"
                           ${readonly ? 'disabled' : ''}>
                </label>
                <small>Multiplier when selling to players</small>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-section">
                <label>Open Hour
                    <input type="number" name="openHour" value="${mob.openHour}" 
                           min="0" max="23"
                           ${readonly ? 'disabled' : ''}>
                </label>
                <small>Shop opens at this hour</small>
            </div>
            
            <div class="form-section">
                <label>Close Hour
                    <input type="number" name="closeHour" value="${mob.closeHour}" 
                           min="0" max="23"
                           ${readonly ? 'disabled' : ''}>
                </label>
                <small>Shop closes at this hour</small>
            </div>
        </div>
    `;
    
    // Attach change handlers
    if (!readonly) {
        container.querySelectorAll('select[name], input[name]').forEach(input => {
            input.addEventListener('change', e => {
                let value = e.target.value;
                
                if (e.target.name.startsWith('buyType_')) {
                    const idx = parseInt(e.target.name.split('_')[1], 10);
                    mob.buyType[idx] = parseInt(value, 10) || 0;
                } else if (['profitBuy', 'profitSell', 'openHour', 'closeHour'].includes(e.target.name)) {
                    mob[e.target.name] = parseInt(value, 10) || 0;
                }
                
                if (onChange) onChange(mob);
            });
        });
    }
    
    return container;
}

