/* area-form.js - Area editor form for EditIt */

import { areaFlagsName, planeName, AFLAG_DONT_SET, AREA_NEW_FORMAT, AREA_BATTLEGROUND } from './constants.js';
import { createFlagGroup } from './flags.js';
import { escapeHtml, wrapTextareaWithGuide, hasEntities, countEntities, validateVnumShift, shiftVnums, showToast } from './utils.js';

/**
 * Render area form
 * @param {Object} area - Area general data (state.area.general)
 * @param {Function} onChange - Callback when form changes: (area) => void
 * @param {Object} options - Additional options
 * @param {boolean} options.readonly - Make form read-only (default: false)
 * @param {Object} options.fullArea - Full area data for VNum shift (state.area)
 * @param {Function} options.onVnumShift - Callback after VNums are shifted
 * @returns {HTMLElement}
 */
export function renderAreaForm(area, onChange, options = {}) {
    const { readonly = false, fullArea = null, onVnumShift = null } = options;
    
    // Create container
    const container = document.createElement('div');
    container.className = 'area-form form-entity';
    
    // Build form HTML
    container.innerHTML = `
        <div class="form-header">
            <h3>Area Settings</h3>
        </div>
        
        <div class="form-section">
            <h4>Basic Info</h4>
            <label>Area Name <span class="hint">(may include description)</span></label>
            <input type="text" 
                   name="areaName" 
                   value="${escapeHtml(area.areaName)}" 
                   placeholder="Area name and description"
                   ${readonly ? 'disabled' : ''}>
            
            <label>Author</label>
            <input type="text" 
                   name="author" 
                   value="${escapeHtml(area.author)}" 
                   placeholder="Author name"
                   ${readonly ? 'disabled' : ''}>
        </div>
        
        <div class="form-section">
            <h4>VNum Settings</h4>
            <div class="form-row">
                <div class="form-section">
                    <label>Starting VNum</label>
                    <input type="number" 
                           name="VNumStart" 
                           value="${area.VNumStart}" 
                           min="1" 
                           max="65534"
                           ${readonly ? 'disabled' : ''}>
                </div>
                
                <div class="form-section">
                    <label>Recall VNum</label>
                    <input type="number" 
                           name="recallVNum" 
                           value="${area.recallVNum}" 
                           min="0" 
                           max="65534"
                           ${readonly ? 'disabled' : ''}>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h4>Level Range <span class="hint">(recommended for this area)</span></h4>
            <div class="form-row">
                <div class="form-section">
                    <label>Min Level <span class="hint">(1 - 50)</span></label>
                    <input type="number" 
                           name="racMinLev" 
                           value="${area.racMinLev}" 
                           min="1" 
                           max="50"
                           ${readonly ? 'disabled' : ''}>
                </div>
                
                <div class="form-section">
                    <label>Max Level <span class="hint">(1 - 50)</span></label>
                    <input type="number" 
                           name="racMaxLev" 
                           value="${area.racMaxLev}" 
                           min="1" 
                           max="50"
                           ${readonly ? 'disabled' : ''}>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h4>Wilderness Settings</h4>

        </div>
        
        <div class="form-section">
            <h4>Miscellaneous</h4>
            <label>Plane</label>
            <select name="planeName" ${readonly ? 'disabled' : ''}>
                ${planeName.map(p => `<option value="${p}" ${area.planeName === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
            
            <label>Music File</label>
            <input type="text" 
                   name="areaMusic" 
                   value="${escapeHtml(area.areaMusic)}" 
                   placeholder="Path to music file"
                   ${readonly ? 'disabled' : ''}>
            
            <label>Reset Message</label>
            <textarea name="resetMsg" 
                      rows="3" 
                      placeholder="Message shown when area resets"
                      ${readonly ? 'disabled' : ''}>${escapeHtml(area.resetMsg)}</textarea>
        </div>
        
        <div class="form-section">
            <h4>Area Flags</h4>
            <div id="area-flags-container"></div>
        </div>
    `;
    
    // Wrap resetMsg textarea with column guide
    const resetMsgTa = container.querySelector('textarea[name="resetMsg"]');
    if (resetMsgTa) {
        wrapTextareaWithGuide(resetMsgTa);
    }
    
    // Add flags group
    const flagsContainer = container.querySelector('#area-flags-container');
    if (flagsContainer) {
        const flagsData = areaFlagsName
            .map((name, index) => {
                if (!name) return null; // Skip empty entries
                const value = Math.pow(2, index);
                // Skip flags that shouldn't be set by user
                if (value & AFLAG_DONT_SET) return null;
                return { value, label: name };
            })
            .filter(Boolean);
        
        const flagGroup = createFlagGroup(
            'areaFlags',
            flagsData,
            area.areaFlags,
            (newValue) => {
                area.areaFlags = newValue;
                updateFieldStates(container, area);
                if (onChange) onChange(area);
            },
            { columns: 2, disabled: readonly }
        );
        
        flagsContainer.appendChild(flagGroup.container);
    }
    
    // Attach change handlers
    if (!readonly) {
        attachChangeHandlers(container, area, onChange, fullArea, onVnumShift);
        // Initial state update based on flags
        updateFieldStates(container, area);
    }
    
    return container;
}

/**
 * Update field states based on area flags
 * @param {HTMLElement} container
 * @param {Object} area
 */
function updateFieldStates(container, area) {
    const isNewFormat = (area.areaFlags & AREA_NEW_FORMAT) !== 0;
    const isBattleground = (area.areaFlags & AREA_BATTLEGROUND) !== 0;
    
    // Fields enabled only with New Format flag
    const newFormatFields = ['areaMusic', 'resetMsg', 'planeName'];
    newFormatFields.forEach(name => {
        const el = container.querySelector(`[name="${name}"]`);
        if (el) el.disabled = !isNewFormat;
    });
    

    
    // Other area flags (bits 1-10): disabled without New Format
    const flagsContainer = container.querySelector('#area-flags-container');
    if (flagsContainer) {
        const checkboxes = flagsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.disabled = !isNewFormat;
        });
        // One-way toggle: once new format is checked, lock it
        const newFormatCb = flagsContainer.querySelector(
            `input[type="checkbox"][value="${AREA_NEW_FORMAT}"]`
        );
        if (newFormatCb) {
            newFormatCb.disabled = newFormatCb.checked;
        }
    }
}

/**
 * Attach change handlers to form inputs
 * @param {HTMLElement} container
 * @param {Object} area - Area general data
 * @param {Function} onChange
 * @param {Object|null} fullArea - Full area data for VNum shift
 * @param {Function|null} onVnumShift - Callback after VNums are shifted
 */
function attachChangeHandlers(container, area, onChange, fullArea, onVnumShift) {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Skip the flags container (handled separately)
        if (input.closest('#area-flags-container')) return;
        
        const field = input.name;
        const isVnumStart = field === 'VNumStart';
        
        const handler = (e) => {
            let value = e.target.value;
            
            // Parse number fields
            if (['VNumStart', 'recallVNum', 'racMinLev', 'racMaxLev'].includes(field)) {
                value = parseInt(value, 10) || 0;
            }
            
            // Handle VNumStart changes - offer to shift existing entities
            if (isVnumStart && value !== area.VNumStart && fullArea) {
                const oldStart = area.VNumStart;
                const offset = value - oldStart;
                
                if (hasEntities(fullArea)) {
                    // Validate the shift first
                    const validation = validateVnumShift(fullArea, offset);
                    if (validation) {
                        alert(`Cannot shift VNums: ${validation.error}`);
                        e.target.value = oldStart; // Revert input
                        return;
                    }
                    
                    // Count entities for the dialog
                    const counts = countEntities(fullArea);
                    const parts = [];
                    if (counts.mobs > 0) parts.push(`${counts.mobs} mobile${counts.mobs !== 1 ? 's' : ''}`);
                    if (counts.objs > 0) parts.push(`${counts.objs} object${counts.objs !== 1 ? 's' : ''}`);
                    if (counts.rooms > 0) parts.push(`${counts.rooms} room${counts.rooms !== 1 ? 's' : ''}`);
                    
                    const entityList = parts.join(', ');
                    const direction = offset > 0 ? '+' : '';
                    
                    const message = `Starting VNum changed from ${oldStart} to ${value} (offset: ${direction}${offset}).\n\n` +
                        `Area contains: ${entityList}\n\n` +
                        `Do you want to shift all VNums by ${direction}${offset}?\n\n` +
                        `Click OK to shift all VNums, or Cancel to revert.`;
                    
                    if (confirm(message)) {
                        // User chose to shift
                        shiftVnums(fullArea, offset);
                        area[field] = value;
                        updateFieldStates(container, area);
                        if (onChange) onChange(area);
                        if (onVnumShift) onVnumShift();
                    } else {
                        // User chose not to shift - revert the input
                        e.target.value = oldStart;
                        return;
                    }
                } else {
                    // No entities, just update
                    area[field] = value;
                    updateFieldStates(container, area);
                    if (onChange) onChange(area);
                }
            } else if ((field === 'racMinLev' || field === 'racMaxLev') && (value < 1 || value > 50)) {
                showToast(`${field === 'racMinLev' ? 'Min' : 'Max'} Level must be between 1 and 50`, 'warning');
                area[field] = value;
                updateFieldStates(container, area);
                if (onChange) onChange(area);
            } else {
                // Normal field update
                area[field] = value;
                updateFieldStates(container, area);
                if (onChange) onChange(area);
            }
        };
        
        // VNumStart: only 'change' event (fires on blur/Enter)
        // recallVNum: validate on blur only
        // Other fields: both 'change' and 'input' for real-time updates
        if (isVnumStart) {
            input.addEventListener('change', handler);
        } else if (field === 'recallVNum') {
            input.addEventListener('change', handler);
            input.addEventListener('blur', () => {
                const val = parseInt(input.value, 10) || 0;
                if (val !== 0) {
                    const rooms = fullArea ? fullArea.rooms : (area.rooms || []);
                    const roomExists = rooms.some(r => r.VNum === val);
                    if (!roomExists) {
                        showToast(`Recall VNum ${val} does not exist in this area`, 'warning');
                    }
                }
            });
        } else {
            input.addEventListener('change', handler);
            input.addEventListener('input', handler);
        }
    });
}
