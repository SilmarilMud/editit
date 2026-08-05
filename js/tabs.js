/* tabs.js - Tab container component for EditIt */

/**
 * Tab structure
 * @typedef {Object} Tab
 * @property {string} id - Unique identifier
 * @property {string} label - Display text
 * @property {string} icon - Entity icon
 * @property {HTMLElement} content - Content container
 */

// Tab state
const tabs = new Map();
let activeTabId = null;
let tabsContainer = null;
let contentContainer = null;
let onTabChange = null;

// Configuration
const MAX_TABS = 10;

/**
 * Initialize tab container
 * @param {HTMLElement} tabsEl - Tabs header container
 * @param {HTMLElement} contentEl - Tab content container
 * @param {Object} options - Configuration options
 */
export function initTabs(tabsEl, contentEl, options = {}) {
    tabsContainer = tabsEl;
    contentContainer = contentEl;
    onTabChange = options.onTabChange || (() => {});
}

/**
 * Create a new tab
 * @param {string} id - Unique identifier
 * @param {string} label - Display text
 * @param {string} icon - Entity icon (optional)
 * @returns {HTMLElement|null} Content container for the tab, or null if limit reached
 */
export function createTab(id, label, icon = '') {
    // Check if tab already exists
    if (tabs.has(id)) {
        showTab(id);
        return tabs.get(id).content;
    }
    
    // Check max tabs limit
    if (tabs.size >= MAX_TABS) {
        return null; // Signal that limit is reached
    }
    
    // Create tab header
    const header = document.createElement('div');
    header.className = 'tab-header';
    header.dataset.id = id;
    
    // Icon
    if (icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'tab-icon';
        iconSpan.textContent = icon;
        header.appendChild(iconSpan);
    }
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'tab-label';
    labelSpan.textContent = label;
    header.appendChild(labelSpan);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.title = 'Close';
    header.appendChild(closeBtn);
    
    // Create content container
    const content = document.createElement('div');
    content.id = `tab-content-${id}`;
    content.className = 'tab-content';
    contentContainer.appendChild(content);
    
    // Store tab
    tabs.set(id, {
        id,
        label,
        icon,
        header,
        content
    });
    
    // Add event listeners
    header.addEventListener('click', (e) => {
        // Don't select if clicking close button
        if (!e.target.classList.contains('tab-close')) {
            showTab(id);
        }
    });
    
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(id);
    });
    
    // Add to DOM
    tabsContainer.appendChild(header);
    
    // Show this tab
    showTab(id);
    
    return content;
}

/**
 * Show a tab
 * @param {string} id - Tab id
 */
export function showTab(id) {
    const tab = tabs.get(id);
    if (!tab) return;
    
    // Hide all tabs
    tabs.forEach((t) => {
        t.header.classList.remove('active');
        t.content.classList.remove('active');
    });
    
    // Show selected tab
    tab.header.classList.add('active');
    tab.content.classList.add('active');
    activeTabId = id;
    
    // Scroll tab header into view
    tab.header.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    
    // Notify listener
    onTabChange(id, tab);
}

/**
 * Close a tab
 * @param {string} id - Tab id
 */
export function closeTab(id) {
    const tab = tabs.get(id);
    if (!tab) return;
    
    // Remove from DOM
    tab.header.remove();
    tab.content.remove();
    
    // Remove from map
    tabs.delete(id);
    
    // If this was the active tab, show another
    if (activeTabId === id) {
        activeTabId = null;
        
        // Show the last remaining tab, or first
        const remaining = Array.from(tabs.keys());
        if (remaining.length > 0) {
            showTab(remaining[remaining.length - 1]);
        }
    }
}

/**
 * Get active tab id
 * @returns {string|null}
 */
export function getActiveTab() {
    return activeTabId;
}

/**
 * Get tab content element
 * @param {string} id - Tab id
 * @returns {HTMLElement|null}
 */
export function getTabContent(id) {
    const tab = tabs.get(id);
    return tab ? tab.content : null;
}

/**
 * Refresh tab content without switching to it
 * @param {string} id - Tab id
 * @param {Function} renderFn - Function to render new content
 * @returns {boolean} - true if tab was refreshed
 */
export function refreshTab(id, renderFn) {
    const tab = tabs.get(id);
    if (!tab) return false;
    
    // Clear existing content
    tab.content.innerHTML = '';
    
    // Render new content
    renderFn(tab.content);
    
    return true;
}

/**
 * Check if tab exists
 * @param {string} id - Tab id
 * @returns {boolean}
 */
export function hasTab(id) {
    return tabs.has(id);
}

/**
 * Rename a tab
 * @param {string} id - Tab id
 * @param {string} newLabel - New label
 */
export function renameTab(id, newLabel) {
    const tab = tabs.get(id);
    if (!tab) return;
    
    const labelSpan = tab.header.querySelector('.tab-label');
    if (labelSpan) {
        labelSpan.textContent = newLabel;
    }
    tab.label = newLabel;
}

/**
 * Close all tabs
 */
export function closeAllTabs() {
    const ids = Array.from(tabs.keys());
    ids.forEach(id => closeTab(id));
}

/**
 * Get number of open tabs
 * @returns {number}
 */
export function getTabCount() {
    return tabs.size;
}

/**
 * Check if max tabs reached
 * @returns {boolean}
 */
export function isMaxTabsReached() {
    return tabs.size >= MAX_TABS;
}

/**
 * Get max tabs limit
 * @returns {number}
 */
export function getMaxTabs() {
    return MAX_TABS;
}
