/* utils.js - Shared utility functions */

import { SOFT_MAX_COLS, HARD_MAX_COLS, MAX_VNUM } from './constants.js';

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
 * @param {number} softMax - Soft max columns for warning (default: from constants)
 * @param {number} hardMax - Hard max columns for error (default: from constants)
 * @returns {HTMLElement} The wrapper element
 */
export function wrapTextareaWithGuide(textarea, softMax = SOFT_MAX_COLS, hardMax = HARD_MAX_COLS) {
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
        
        // Check for lines exceeding limits
        const softOverLines = lines.filter(l => l.length > softMax);
        const hardOverLines = lines.filter(l => l.length > hardMax);
        const hasSoftOver = softOverLines.length > 0;
        const hasHardOver = hardOverLines.length > 0;
        
        // Update status text
        const statusText = document.createElement('span');
        statusText.className = 'textarea-info';
        statusText.innerHTML = `Ln <span class="val">${String(currentLine).padStart(2)}</span>, Col <span class="val">${String(currentCol).padStart(2)}</span> | <span class="val">${String(lineCount).padStart(2)}</span> lines`;
        status.innerHTML = '';
        status.appendChild(statusText);
        
        // Add Tidy button
        const tidyBtn = document.createElement('button');
        tidyBtn.type = 'button';
        tidyBtn.className = 'tidy-btn';
        tidyBtn.textContent = '✦ Tidy';
        tidyBtn.title = 'Auto-format text to fit column limits';
        tidyBtn.addEventListener('click', () => {
            const original = textarea.value;
            const formatted = arrangeText(original);
            if (original !== formatted) {
                textarea.value = formatted;
                // Dispatch input event for real-time updates
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                // Dispatch change event for undo recording
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        status.appendChild(tidyBtn);
        
        if (hasHardOver) {
            const warn = document.createElement('span');
            warn.className = 'textarea-warn hard';
            warn.textContent = ` | ${hardOverLines.length} line(s) exceed ${hardMax} cols`;
            status.appendChild(warn);
        } else if (hasSoftOver) {
            const warn = document.createElement('span');
            warn.className = 'textarea-warn';
            warn.textContent = ` | ${softOverLines.length} line(s) exceed ${softMax} cols`;
            status.appendChild(warn);
        }
        status.appendChild(markers);
        status.className = `textarea-status${hasHardOver ? ' over-limit' : hasSoftOver ? ' near-limit' : ''}`;
        
        // Update line markers (show max 30 lines)
        markers.innerHTML = '';
        const maxMarkers = Math.min(lineCount, 30);
        for (let i = 0; i < maxMarkers; i++) {
            const marker = document.createElement('span');
            const lineLen = lines[i] ? lines[i].length : 0;
            let state = 'ok';
            if (lineLen > hardMax) {
                state = 'error';
            } else if (lineLen > softMax) {
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
 * Arrange text to fit within column limits
 * @param {string} text - Input text
 * @returns {string} Formatted text
 */
export function arrangeText(text) {
    if (!text) return text;
    
    const lines = text.split('\n');
    const result = [];
    const intentionalBreaks = new Set();
    
    // Step 1: Detect intentional breaks (short lines between long lines)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.trim() === '' || line.length >= 60) continue;
        
        const prevLine = lines[i - 1];
        const nextLine = lines[i + 1];
        
        if (prevLine && prevLine.length > 65 && nextLine && nextLine.trim() !== '' && nextLine.length > 65) {
            intentionalBreaks.add(i);
        }
    }
    
    // Step 2: Build paragraphs (split on blank lines or intentional breaks)
    const paragraphs = [];
    let currentParagraph = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.trim() === '') {
            if (currentParagraph.length > 0) {
                paragraphs.push(currentParagraph);
                currentParagraph = [];
            }
            continue;
        }
        
        // Start new paragraph after intentional break
        if (intentionalBreaks.has(i) && currentParagraph.length > 0) {
            paragraphs.push(currentParagraph);
            currentParagraph = [];
        }
        
        currentParagraph.push(line);
    }
    
    if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
    }
    
    // Step 3: Rewrap each paragraph
    let globalLineIndex = 0;
    for (let p = 0; p < paragraphs.length; p++) {
        const para = paragraphs[p];
        
        // Rewrap paragraph to fit column limits
        // But preserve line breaks for intentional break lines
        let currentLine = '';
        for (let i = 0; i < para.length; i++) {
            const line = para[i];
            const isIntentionalBreak = intentionalBreaks.has(globalLineIndex + i);
            
            if (isIntentionalBreak) {
                // Push current line if exists, then push the intentional break line as-is
                if (currentLine) {
                    result.push(currentLine);
                    currentLine = '';
                }
                result.push(line);
            } else {
                // Normal rewrap logic
                const words = line.split(/\s+/).filter(w => w.length > 0);
                for (const word of words) {
                    if (currentLine === '') {
                        currentLine = word;
                    } else if ((currentLine.length + 1 + word.length) <= HARD_MAX_COLS) {
                        currentLine += ' ' + word;
                    } else {
                        result.push(currentLine);
                        currentLine = word;
                    }
                }
            }
        }
        
        if (currentLine) {
            result.push(currentLine);
        }
        
        globalLineIndex += para.length;
        
        // Add blank line between paragraphs ONLY if there was an intentional break
        // Don't add blank lines for regular paragraph breaks (blank lines in input)
        if (p < paragraphs.length - 1) {
            // Check if the next paragraph starts with an intentional break
            const nextParaStart = globalLineIndex;
            if (intentionalBreaks.has(nextParaStart)) {
                result.push('');
            }
        }
    }
    
    // Step 4: Capitalize after sentence endings
    let output = result.join('\n');
    
    output = output.replace(/([.!?])\s+([a-z])/g, (match, punct, letter) => {
        return punct + ' ' + letter.toUpperCase();
    });
    
    if (output.length > 0 && output[0] === output[0].toLowerCase() && output[0] !== output[0].toUpperCase()) {
        output = output[0].toUpperCase() + output.slice(1);
    }
    
    return output;
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
 * Check if area has any entities (mobs, objects, rooms)
 * @param {Object} area - Full area data (state.area)
 * @returns {boolean} True if area has entities
 */
export function hasEntities(area) {
    return area.mobs.length > 0 || area.objs.length > 0 || area.rooms.length > 0;
}

/**
 * Count entities in area
 * @param {Object} area - Full area data (state.area)
 * @returns {Object} Count of each entity type
 */
export function countEntities(area) {
    return {
        mobs: area.mobs.length,
        objs: area.objs.length,
        rooms: area.rooms.length,
    };
}

/**
 * Check if shifting VNums would cause collisions or out-of-range errors
 * @param {Object} area - Full area data (state.area)
 * @param {number} offset - Amount to shift
 * @returns {Object|null} Error object {error: string} or null if ok
 */
export function validateVnumShift(area, offset) {
    const oldStart = area.general.VNumStart;
    const inRange = (v) => v >= oldStart && v > 0;
    const shift = (v) => inRange(v) ? v + offset : v;

    // Track VNums per entity type (mobs, objs, rooms can share VNums)
    const mobVnums = new Set();
    const objVnums = new Set();
    const roomVnums = new Set();

    const checkVnum = (v, label, vnumSet) => {
        if (v <= 0) return null; // Skip unset/invalid
        const newV = shift(v);
        if (newV < 1 || newV >= MAX_VNUM) {
            return { error: `${label} VNum ${v} would become ${newV}, out of range [1, ${MAX_VNUM}]` };
        }
        if (vnumSet.has(newV)) {
            return { error: `Duplicate ${label} VNum ${v} would become ${newV}` };
        }
        vnumSet.add(newV);
        return null;
    };

    // Check each entity type separately
    for (const m of area.mobs) {
        const err = checkVnum(m.VNum, 'Mobile', mobVnums);
        if (err) return err;
    }
    for (const o of area.objs) {
        const err = checkVnum(o.VNum, 'Object', objVnums);
        if (err) return err;
    }
    for (const r of area.rooms) {
        const err = checkVnum(r.VNum, 'Room', roomVnums);
        if (err) return err;
    }

    return null; // All good
}

/**
 * Shift all VNums in the area by the given offset.
 * Only shifts VNums within the area's range (>= old VNumStart).
 * @param {Object} area - Full area data (state.area)
 * @param {number} offset - Amount to shift (can be negative)
 */
export function shiftVnums(area, offset) {
    const oldStart = area.general.VNumStart;
    const inRange = (v) => v >= oldStart && v > 0;
    const shift = (v) => inRange(v) ? v + offset : v;

    // 1. Shift entity primary keys
    area.mobs.forEach(m => { m.VNum = shift(m.VNum); });
    area.objs.forEach(o => { o.VNum = shift(o.VNum); });
    area.rooms.forEach(r => {
        r.VNum = shift(r.VNum);
        // 2. Shift door references within each room
        r.doors.forEach(d => {
            d.VNumTo = shift(d.VNumTo);
            d.keyVNum = shift(d.keyVNum);
        });
        // 3. Shift reset references (loaded mobs)
        r.mobs.forEach(lm => {
            lm.VNum = shift(lm.VNum);
            lm.contain.forEach(child => { child.VNum = shift(child.VNum); });
        });
        // 4. Shift reset references (loaded objects)
        r.objs.forEach(lo => {
            lo.VNum = shift(lo.VNum);
            lo.contain.forEach(child => { child.VNum = shift(child.VNum); });
        });
    });

    // 5. Shift recall VNum
    area.general.recallVNum = shift(area.general.recallVNum);
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
