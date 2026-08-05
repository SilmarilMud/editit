/* utils.js - Shared utility functions */

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * Escape HTML (alias for escapeHtml)
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const esc = escapeHtml;

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Find mob by VNum
 * @param {Array} mobs - Array of mobs
 * @param {number} vnum - VNum to find
 * @returns {Object|null} Found mob or null
 */
export function getMobByVNum(mobs, vnum) {
    return mobs.find(m => m.VNum === vnum) || null;
}

/**
 * Find object by VNum
 * @param {Array} objs - Array of objects
 * @param {number} vnum - VNum to find
 * @returns {Object|null} Found object or null
 */
export function getObjByVNum(objs, vnum) {
    return objs.find(o => o.VNum === vnum) || null;
}

/**
 * Find room by VNum
 * @param {Array} rooms - Array of rooms
 * @param {number} vnum - VNum to find
 * @returns {Object|null} Found room or null
 */
export function getRoomByVNum(rooms, vnum) {
    return rooms.find(r => r.VNum === vnum) || null;
}

/**
 * Wrap a textarea with column guide and line length status
 * @param {HTMLElement} textarea - The textarea element
 * @param {number} maxCols - Maximum columns (default: 80)
 * @returns {HTMLElement} The wrapper element
 */
export function wrapTextareaWithGuide(textarea, maxCols = 80) {
    const wrapper = document.createElement('div');
    wrapper.className = 'textarea-wrapper';
    
    // Insert wrapper before textarea
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);
    
    // Add status bar
    const status = document.createElement('div');
    status.className = 'textarea-status';
    wrapper.appendChild(status);
    
    // Add line markers (inside status bar)
    const markers = document.createElement('span');
    markers.className = 'line-markers';
    status.appendChild(markers);
    
    function updateStatus() {
        const text = textarea.value || '';
        const lines = text.split('\n');
        const lineCount = lines.length;
        
        // Find cursor position (line:col)
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const currentLine = textBeforeCursor.split('\n').length;
        const lastNewline = textBeforeCursor.lastIndexOf('\n');
        const currentCol = cursorPos - lastNewline;
        
        // Check for lines exceeding maxCols
        const longLines = lines.filter(l => l.length > maxCols);
        const hasLongLines = longLines.length > 0;
        
        // Update status text
        const statusText = document.createElement('span');
        statusText.className = 'textarea-info';
        statusText.innerHTML = `Ln <span class="val">${String(currentLine).padStart(2)}</span>, Col <span class="val">${String(currentCol).padStart(2)}</span> | <span class="val">${String(lineCount).padStart(2)}</span> lines`;
        status.innerHTML = '';
        status.appendChild(statusText);
        if (hasLongLines) {
            const warn = document.createElement('span');
            warn.className = 'textarea-warn';
            warn.textContent = ` | ${longLines.length} line(s) exceed ${maxCols} cols`;
            status.appendChild(warn);
        }
        status.appendChild(markers);
        status.className = `textarea-status${hasLongLines ? ' over-limit' : ''}`;
        
        // Update line markers (show max 30 lines)
        markers.innerHTML = '';
        const maxMarkers = Math.min(lineCount, 30);
        for (let i = 0; i < maxMarkers; i++) {
            const marker = document.createElement('span');
            const lineLen = lines[i] ? lines[i].length : 0;
            const isLastLine = i === lineCount - 1;
            const lineText = lines[i] || '';
            const endsWithPeriod = lineText.trimEnd().endsWith('.');
            const isEmpty = lineText.trim() === '';
            let state = 'ok';
            if (lineLen > maxCols) {
                state = 'error';
            } else if (!isLastLine && !isEmpty && !endsWithPeriod && lineLen <= 60) {
                state = 'warn';
            }
            marker.className = `line-marker ${state}`;
            marker.title = `Line ${i + 1}: ${lineLen} chars`;
            markers.appendChild(marker);
        }
        if (lineCount > 30) {
            const more = document.createElement('span');
            more.textContent = `+${lineCount - 30} more`;
            more.style.fontSize = '0.7rem';
            more.style.marginLeft = '0.25rem';
            markers.appendChild(more);
        }
    }
    
    // Update on input, click, and keyup
    textarea.addEventListener('input', updateStatus);
    textarea.addEventListener('click', updateStatus);
    textarea.addEventListener('keyup', updateStatus);
    
    // Initial update
    updateStatus();
    
    return wrapper;
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'warning', 'error', 'info'
 * @param {number} duration - Auto-hide duration in ms (default: 3000)
 */
export function showToast(message, type = 'success', duration = 3000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `app-toast app-toast-${type}`;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    
    // Clear any existing timeout
    if (toast._hideTimeout) {
        clearTimeout(toast._hideTimeout);
    }
    
    // Auto-hide with fade out
    toast._hideTimeout = setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease-out';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.transition = '';
        }, 300);
    }, duration);
}

/**
 * Setup tab switching within a form container.
 * Finds `.form-tab-btn` buttons and `.form-tab-content` panels,
 * and wires click handlers to toggle the active tab.
 * @param {HTMLElement} container - The form container with tabs
 */
export function setupTabs(container) {
    const tabs = container.querySelectorAll('.form-tab-btn');
    const contents = container.querySelectorAll('.form-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            container.querySelector(`.form-tab-content[data-tab="${tab.dataset.tab}"]`)?.classList.add('active');
        });
    });
}
