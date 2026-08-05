/* flags.js - Reusable flag checkbox group component for EditIt */

/**
 * Flag group structure
 * @typedef {Object} FlagGroup
 * @property {HTMLElement} container - The rendered container element
 * @property {Function} getValue - Get current bitfield value
 * @property {Function} setValue - Set bitfield value programmatically
 * @property {Function} destroy - Clean up event listeners
 */

// Active flag groups for cleanup
const flagGroups = new Map();

/**
 * Create a flag checkbox group
 * @param {string} name - Field name for form binding
 * @param {Array<{value: number, label: string}>} flags - Flag options
 * @param {number} value - Current bitfield value
 * @param {Function} onChange - Callback with new value: (newValue: number) => void
 * @param {Object} options - Additional options
 * @param {string} options.layout - 'grid' (default) or 'list'
 * @param {number} options.columns - Number of columns for grid layout (default: 3)
 * @param {boolean} options.showAll - Show "Select All" / "Clear All" buttons (default: true)
 * @param {boolean} options.disabled - Disable all checkboxes (default: false)
 * @param {string} options.className - Additional CSS class
 * @returns {FlagGroup}
 */
export function createFlagGroup(name, flags, value, onChange, options = {}) {
    const {
        layout = 'grid',
        columns = 3,
        showAll = true,
        disabled = false,
        className = ''
    } = options;

    // Create container
    const container = document.createElement('div');
    container.className = `flag-group ${className}`;
    container.dataset.name = name;
    
    if (layout === 'grid') {
        container.classList.add('flag-group-grid');
        container.style.setProperty('--flag-columns', columns);
    }

    // Track current value
    let currentValue = value;

    // Create checkboxes container
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'flag-group-checkboxes';
    
    // Store checkbox elements for updates
    const checkboxElements = new Map();
    
    // Create each checkbox
    flags.forEach(flag => {
        const wrapper = document.createElement('label');
        wrapper.className = 'flag-checkbox-wrapper';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = `${name}_${flag.value}`;
        checkbox.value = flag.value;
        checkbox.checked = (currentValue & flag.value) !== 0;
        checkbox.disabled = disabled;
        
        const span = document.createElement('span');
        span.className = 'flag-checkbox-label';
        span.textContent = flag.label;
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(span);
        checkboxesContainer.appendChild(wrapper);
        
        checkboxElements.set(flag.value, checkbox);
        
        // Handle change
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                currentValue |= flag.value;
            } else {
                currentValue &= ~flag.value;
            }
            if (onChange) onChange(currentValue);
        });
    });
    
    container.appendChild(checkboxesContainer);

    /**
     * Update checkbox states from current value
     */
    function updateCheckboxes() {
        checkboxElements.forEach((checkbox, flagValue) => {
            checkbox.checked = (currentValue & flagValue) !== 0;
        });
    }

    /**
     * Get current bitfield value
     * @returns {number}
     */
    function getValue() {
        return currentValue;
    }

    /**
     * Set bitfield value programmatically
     * @param {number} newValue
     */
    function setValue(newValue) {
        currentValue = newValue;
        updateCheckboxes();
    }

    /**
     * Clean up event listeners and remove from active groups
     */
    function destroy() {
        flagGroups.delete(name);
        container.remove();
    }

    // Store in active groups
    flagGroups.set(name, { container, getValue, setValue, destroy });

    return { container, getValue, setValue, destroy };
}

/**
 * Get all active flag groups
 * @returns {Map<string, FlagGroup>}
 */
export function getFlagGroups() {
    return flagGroups;
}

/**
 * Get a specific flag group by name
 * @param {string} name
 * @returns {FlagGroup|undefined}
 */
export function getFlagGroup(name) {
    return flagGroups.get(name);
}

/**
 * Create a compact inline flag group (no header buttons)
 * @param {string} name - Field name
 * @param {Array<{value: number, label: string}>} flags - Flag options
 * @param {number} value - Current value
 * @param {Function} onChange - Change callback
 * @returns {FlagGroup}
 */
export function createCompactFlagGroup(name, flags, value, onChange) {
    return createFlagGroup(name, flags, value, onChange, {
        layout: 'list',
        showAll: false,
        className: 'flag-group-compact'
    });
}

/**
 * Create a read-only flag display (shows active flags as text)
 * @param {Array<{value: number, label: string}>} flags - Flag options
 * @param {number} value - Bitfield value
 * @returns {HTMLElement}
 */
export function createFlagDisplay(flags, value) {
    const container = document.createElement('div');
    container.className = 'flag-display';
    
    const activeFlags = flags.filter(f => (value & f.value) !== 0);
    
    if (activeFlags.length === 0) {
        container.textContent = '(none)';
    } else {
        activeFlags.forEach((f, i) => {
            const span = document.createElement('span');
            span.className = 'flag-display-item';
            span.textContent = f.label;
            container.appendChild(span);
            
            if (i < activeFlags.length - 1) {
                container.appendChild(document.createTextNode(', '));
            }
        });
    }
    
    return container;
}

/**
 * Helper: Convert array of flag values to bitfield
 * @param {number[]} values - Array of flag values
 * @returns {number}
 */
export function flagsToBitfield(values) {
    return values.reduce((bitfield, val) => bitfield | val, 0);
}

/**
 * Helper: Convert bitfield to array of active flag values
 * @param {number} bitfield - Bitfield value
 * @param {Array<{value: number, label: string}>} flags - All possible flags
 * @returns {number[]}
 */
export function bitfieldToFlags(bitfield, flags) {
    return flags.filter(f => (bitfield & f.value) !== 0).map(f => f.value);
}
