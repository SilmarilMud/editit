/* area-form.js - Area editor form for EditIt */

import { areaFlagsName, planeName, AFLAG_DONT_SET, AREA_NEWFORMAT, AREA_BATTLEGROUND } from './constants.js';
import { createFlagGroup } from './flags.js';
import { escapeHtml, wrapTextareaWithGuide } from './utils.js';

/**
 * Render area form
 * @param {Object} area - Area general data (state.area.general)
 * @param {Function} onChange - Callback when form changes: (area) => void
 * @param {Object} options - Additional options
 * @param {boolean} options.readonly - Make form read-only (default: false)
 * @returns {HTMLElement}
 */
export function renderAreaForm(area, onChange, options = {}) {
    const { readonly = false } = options;
    
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
                    <label>Min Level</label>
                    <input type="number" 
                           name="racMinLev" 
                           value="${area.racMinLev}" 
                           min="0" 
                           max="87"
                           ${readonly ? 'disabled' : ''}>
                </div>
                
                <div class="form-section">
                    <label>Max Level</label>
                    <input type="number" 
                           name="racMaxLev" 
                           value="${area.racMaxLev}" 
                           min="0" 
                           max="87"
                           ${readonly ? 'disabled' : ''}>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h4>Wilderness Settings</h4>
            <label>Sight Description</label>
            <input type="text" 
                   name="Sight" 
                   value="${escapeHtml(area.Sight)}" 
                   placeholder="What players see in wilderness"
                   ${readonly ? 'disabled' : ''}>
            
            <label>Sight Distance</label>
            <input type="number" 
                   name="SightDist" 
                   value="${area.SightDist}" 
                   min="0"
                   ${readonly ? 'disabled' : ''}>
        </div>
        
        <div class="form-section">
            <h4>Miscellaneous</h4>
            <label>Plane</label>
            <select name="planeName" ${readonly ? 'disabled' : ''}>
                ${planeName.map(p => `<option value="${p}" ${area.planeName === p ? 'selected' : ''}>${p || '(none)'}</option>`).join('')}
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
        attachChangeHandlers(container, area, onChange);
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
    const isNewFormat = (area.areaFlags & AREA_NEWFORMAT) !== 0;
    const isBattleground = (area.areaFlags & AREA_BATTLEGROUND) !== 0;
    
    // Fields enabled only with New Format flag
    const newFormatFields = ['areaMusic', 'resetMsg'];
    newFormatFields.forEach(name => {
        const el = container.querySelector(`[name="${name}"]`);
        if (el) el.disabled = !isNewFormat;
    });
    
    // Sight fields: enabled with New Format, disabled with Battle Ground
    const sightFields = ['Sight', 'SightDist'];
    sightFields.forEach(name => {
        const el = container.querySelector(`[name="${name}"]`);
        if (el) el.disabled = !isNewFormat || isBattleground;
    });
    
    // Other area flags (bits 1-10): disabled without New Format
    const flagsContainer = container.querySelector('#area-flags-container');
    if (flagsContainer) {
        const checkboxes = flagsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            // Don't touch the New Format checkbox itself (bit 0)
            if (parseInt(cb.value, 10) === AREA_NEWFORMAT) return;
            cb.disabled = !isNewFormat;
        });
    }
}

/**
 * Attach change handlers to form inputs
 * @param {HTMLElement} container
 * @param {Object} area
 * @param {Function} onChange
 */
function attachChangeHandlers(container, area, onChange) {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Skip the flags container (handled separately)
        if (input.closest('#area-flags-container')) return;
        
        const handler = (e) => {
            const field = e.target.name;
            let value = e.target.value;
            
            // Parse number fields
            if (['VNumStart', 'recallVNum', 'racMinLev', 'racMaxLev', 'SightDist'].includes(field)) {
                value = parseInt(value, 10) || 0;
            }
            
            // Update the area entity
            area[field] = value;
            
            // Update field states when flags change
            updateFieldStates(container, area);
            
            // Notify parent
            if (onChange) onChange(area);
        };
        
        input.addEventListener('change', handler);
        input.addEventListener('input', handler);
    });
}
