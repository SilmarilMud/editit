/* help-form.js - Help editor form for EditIt */

import { escapeHtml, wrapTextareaWithGuide } from './utils.js';

/**
 * Help form structure
 * @typedef {Object} HelpForm
 * @property {HTMLElement} container - The rendered form container
 * @property {Function} destroy - Clean up event listeners
 */

// Active form instances for cleanup
const activeForms = new Map();

/**
 * Render help form
 * @param {Object} help - Help entity from area.helps[]
 * @param {Function} onChange - Callback when form changes: (help) => void
 * @param {Object} options - Additional options
 * @param {boolean} options.readonly - Make form read-only (default: false)
 * @returns {HelpForm}
 */
export function renderHelpForm(help, onChange, options = {}) {
    const { readonly = false } = options;
    
    // Create container
    const container = document.createElement('div');
    container.className = 'help-form form-entity';
    
    // Build form HTML
    container.innerHTML = `
        <div class="form-header">
            <h3>[${help.level}] ${help.keywords || 'new help'}</h3>
        </div>
        
        <div class="form-section">
            <label>Level <span class="hint">(0 = everyone)</span></label>
            <input type="number" 
                   name="level" 
                   value="${help.level}" 
                   min="0" 
                   max="87"
                   ${readonly ? 'disabled' : ''}>
        </div>
        
        <div class="form-section">
            <label>Keywords <span class="hint">(space-separated)</span></label>
            <input type="text" 
                   name="keywords" 
                   value="${escapeHtml(help.keywords)}" 
                   placeholder="keyword1 keyword2 keyword3"
                   ${readonly ? 'disabled' : ''}>
        </div>
        
        <div class="form-section">
            <label>Text</label>
            <textarea name="text" 
                      rows="12" 
                      placeholder="Help text content..."
                      ${readonly ? 'disabled' : ''}>${escapeHtml(help.text)}</textarea>
        </div>
    `;
    
    // Store reference for cleanup
    const formInstance = {
        container,
        help,
        onChange,
        handlers: []
    };
    
    // Attach event listeners
    if (!readonly) {
        attachChangeHandlers(formInstance);
    }
    
    // Wrap text textarea with column guide
    const textTa = container.querySelector('textarea[name="text"]');
    if (textTa) {
        wrapTextareaWithGuide(textTa, 80);
    }
    
    activeForms.set(help, formInstance);
    
    return {
        container,
        destroy: () => {
            activeForms.delete(help);
            container.remove();
        }
    };
}

/**
 * Attach change handlers to form inputs
 * @param {HelpForm} formInstance
 */
function attachChangeHandlers(formInstance) {
    const { container, help, onChange } = formInstance;
    
    const inputs = container.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const handler = (e) => {
            const field = e.target.name;
            let value = e.target.value;
            
            // Parse number fields
            if (field === 'level') {
                value = parseInt(value, 10) || 0;
                value = Math.max(0, Math.min(87, value));
            }
            
            // Update the help entity
            help[field] = value;
            
            // Update header if level or keywords changed
            if (field === 'keywords' || field === 'level') {
                const header = container.querySelector('.form-header h3');
                if (header) {
                    header.textContent = `[${help.level}] ${help.keywords || 'new help'}`;
                }
            }
            
            // Notify parent
            if (onChange) onChange(help);
        };
        
        input.addEventListener('change', handler);
        input.addEventListener('input', handler);
        formInstance.handlers.push({ element: input, handler });
    });
}

/**
 * Escape HTML special characters
 * @param {string} str
 * @returns {string}
 */

/**
 * Destroy all active help forms
 */
export function destroyAllHelpForms() {
    activeForms.forEach((form, help) => {
        form.container.remove();
    });
    activeForms.clear();
}

/**
 * Get active help form for a help entity
 * @param {Object} help
 * @returns {HelpForm|undefined}
 */
export function getActiveHelpForm(help) {
    return activeForms.get(help);
}
