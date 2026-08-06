/* main.js - Entry point for EditIt */

const DEBUG = false;

import { parseFile } from './parser.js';
import { createArea, createHelp, createObject, createMobile, createRoom } from './constants.js';
import { serializeFile } from './writer.js';
import {
    initDB,
    openFile,
    saveFile,
    startAutoSave,
    stopAutoSave,
    autoSave,
    getAutoSave,
    getAutoSaveHistory,
    clearAutoSave,
    getCorruptAutoSave,
    dbPut,
    dbDelete,
    addRecent,
    getRecent,
    clearRecent,
    getCapabilities,
    checkBrowserSupport,
    hasFileSystemAccess,
    hasIndexedDB
} from './storage.js';
import {
    initTree,
    renderTree,
    expandAll,
    collapseAll,
    getSelectedNode,
    clearSelection,
    addNode,
    removeNode,
    getNode,
    updateNodeLabel
} from './tree.js';
import {
    initTabs,
    createTab,
    showTab,
    closeTab,
    closeAllTabs,
    hasTab,
    renameTab,
    refreshTab,
    isMaxTabsReached,
    getMaxTabs,
    getActiveTab
} from './tabs.js';
import { renderHelpForm } from './help-form.js';
import { renderAreaForm } from './area-form.js';
import { renderMobileForm } from './mobile-form.js';
import { renderObjectForm } from './object-form.js';
import { renderRoomForm } from './room-form.js';
import { renderResetPanel } from './reset-panel.js';
import { renderShopForm } from './shop-form.js';
import { renderSpecialsPanel } from './specials-panel.js';
import { renderStatsPanel } from './stats-panel.js';
import { showToast, getMobByVNum, getObjByVNum, getRoomByVNum, escapeHtml } from './utils.js';
import {
    validateAll,
    hasBlockingErrors,
    initValidationPanel,
    runValidation,
    shouldAutoValidate
} from './validation.js';
import { undoManager, ActionType, describeAction } from './undo.js';
import { searchArea, getContextSnippet, highlightMatch, ENTITY_TYPE_ICONS, ENTITY_TYPE_NAMES } from './search.js';
import { initMap, openMap, closeMap, isMapOpen, mapFloorUp, mapFloorDown, zoomIn, zoomOut, zoomFit, exportAllFloorsPNG } from './map.js';

// Entity type icons
const TYPE_ICONS = {
    room: '🚪',
    mob: '👤',
    object: '📦',
    help: '❓',
    reset: '🔄',
    shop: '🏪',
    special: '✨'
};

/**
 * Application state
 */
const state = {
    filename: null,
    handle: null,
    text: null,
    area: null,
    modified: false,
    selectedNode: null,
    activeTab: null
};

// Search state
let searchResults = [];
let searchActiveIndex = -1;
let searchDebounceTimer = null;

let dirtyTimeout = null;

/**
 * Initialize search UI
 */
function initSearch() {
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    if (!input || !resultsEl) return;
    
    // Debounced search on input
    input.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            performSearch(input.value);
        }, 200);
    });
    
    // Keyboard navigation in search
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearch();
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateSearch(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSearch(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectSearchResult();
        }
    });
    
    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container')) {
            closeSearch();
        }
    });
}

/**
 * Perform search and render results
 * @param {string} query
 */
function performSearch(query) {
    const resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    
    if (!query || query.trim() === '' || !state.area) {
        closeSearch();
        return;
    }
    
    searchResults = searchArea(state.area, query);
    searchActiveIndex = -1;
    
    if (searchResults.length === 0) {
        resultsEl.innerHTML = '<div class="search-empty">No results found</div>';
        resultsEl.classList.remove('hidden');
        return;
    }
    
    // Render results
    let html = `<div class="search-summary">${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}</div>`;
    
    for (let i = 0; i < searchResults.length; i++) {
        const r = searchResults[i];
        const icon = ENTITY_TYPE_ICONS[r.entityType] || '';
        const typeName = ENTITY_TYPE_NAMES[r.entityType] || r.entityType;
        const title = getSearchResultTitle(r);
        const snippet = getContextSnippet(r.match, query, {});
        const highlightedSnippet = highlightMatch(snippet, query, {});
        
        html += `
            <div class="search-result" data-index="${i}" data-node-id="${r.nodeId}">
                <span class="search-result-icon">${icon}</span>
                <div class="search-result-info">
                    <div class="search-result-title">${escapeHtml(title)}</div>
                    <div class="search-result-field">${typeName} · ${r.field}</div>
                    <div class="search-result-snippet">${highlightedSnippet}</div>
                </div>
            </div>`;
    }
    
    resultsEl.innerHTML = html;
    resultsEl.classList.remove('hidden');
    
    // Add click handlers
    resultsEl.querySelectorAll('.search-result').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index, 10);
            searchActiveIndex = idx;
            selectSearchResult();
        });
    });
}

/**
 * Get display title for a search result
 * @param {Object} result
 * @returns {string}
 */
function getSearchResultTitle(result) {
    const e = result.entity;
    switch (result.entityType) {
        case 'area': return e.areaName || 'Unnamed Area';
        case 'mob': return `#${e.VNum} - ${e.shortDescr || 'No name'}`;
        case 'object': return `#${e.VNum} - ${e.shortDescr || 'No name'}`;
        case 'room': return `#${e.VNum} - ${e.name || 'No name'}`;
        case 'help': return `[${e.level}] ${e.keywords || 'No keywords'}`;
        default: return `#${e.VNum || ''}`;
    }
}

/**
 * Navigate search results with arrow keys
 * @param {number} direction - 1 for down, -1 for up
 */
function navigateSearch(direction) {
    if (searchResults.length === 0) return;
    
    // Remove current highlight
    const resultsEl = document.getElementById('search-results');
    const items = resultsEl.querySelectorAll('.search-result');
    items.forEach(el => el.classList.remove('active'));
    
    // Calculate new index
    searchActiveIndex += direction;
    if (searchActiveIndex < 0) searchActiveIndex = searchResults.length - 1;
    if (searchActiveIndex >= searchResults.length) searchActiveIndex = 0;
    
    // Highlight new item
    const activeItem = items[searchActiveIndex];
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Select the current search result (navigate to entity)
 */
function selectSearchResult() {
    if (searchActiveIndex < 0 || searchActiveIndex >= searchResults.length) {
        // If no result highlighted, select first
        if (searchResults.length > 0) {
            searchActiveIndex = 0;
        } else {
            return;
        }
    }
    
    const result = searchResults[searchActiveIndex];
    const node = getNode(result.nodeId);
    
    if (node) {
        closeSearch();
        handleNodeSelection(node);
    }
}

/**
 * Close search results
 */
function closeSearch() {
    const resultsEl = document.getElementById('search-results');
    if (resultsEl) {
        resultsEl.classList.add('hidden');
        resultsEl.innerHTML = '';
    }
    searchResults = [];
    searchActiveIndex = -1;
}

/**
 * Focus search input
 */
function focusSearch() {
    const input = document.getElementById('search-input');
    if (input) {
        input.focus();
        input.select();
    }
}

/**
 * Toggle keyboard shortcuts help dialog
 */
function toggleShortcutsDialog() {
    const dialog = document.getElementById('shortcuts-dialog');
    if (!dialog) return;
    
    if (dialog.open) {
        dialog.close();
    } else {
        dialog.showModal();
    }
}

// Setup shortcuts dialog close button
document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('shortcuts-dialog');
    const closeBtn = dialog?.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => dialog.close());
    }
});

/**
 * Check if an input/textarea is currently focused
 * @returns {boolean}
 */
function isInputFocused() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

/**
 * Close the currently active tab
 */
function closeCurrentTab() {
    const active = getActiveTab();
    if (active) {
        closeTab(active);
    }
}

/**
 * Switch to next/previous tab
 * @param {number} direction - 1 for next, -1 for previous
 */
function switchTab(direction) {
    const active = getActiveTab();
    if (!active) return;
    
    // Get all tab IDs from the DOM
    const tabHeaders = document.querySelectorAll('#tabs .tab-header');
    const ids = Array.from(tabHeaders).map(h => h.dataset.id);
    const idx = ids.indexOf(active);
    
    if (idx === -1) return;
    
    let newIdx = idx + direction;
    if (newIdx < 0) newIdx = ids.length - 1;
    if (newIdx >= ids.length) newIdx = 0;
    
    showTab(ids[newIdx]);
}

/**
 * Duplicate the currently selected entity
 */
function duplicateSelected() {
    const node = getSelectedNode();
    if (node && node.type !== 'category' && node.type !== 'root') {
        handleDuplicateAction(node);
    }
}

/**
 * Delete the currently selected entity
 */
function deleteSelected() {
    const node = getSelectedNode();
    if (node && node.type !== 'category' && node.type !== 'root') {
        handleDeleteAction(node);
    }
}

/**
 * Initialize recent files dropdown
 */
async function initRecent() {
    const btn = document.getElementById('btn-recent');
    const dropdown = document.getElementById('recent-dropdown');
    if (!btn || !dropdown) return;
    
    // Load recent files and update button state
    const recent = await getRecent();
    btn.disabled = recent.length === 0;
    
    // Toggle dropdown on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
            return;
        }
        populateRecent(dropdown);
        dropdown.classList.remove('hidden');
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#recent-container')) {
            dropdown.classList.add('hidden');
        }
    });
}

/**
 * Populate recent files dropdown
 * @param {HTMLElement} dropdown
 */
async function populateRecent(dropdown) {
    const recent = await getRecent();
    
    if (recent.length === 0) {
        dropdown.innerHTML = '<div class="recent-empty">No recent files</div>';
        return;
    }
    
    let html = '';
    for (const item of recent) {
        const ts = item.lastModified || item.timestamp;
        const date = ts ? new Date(ts).toLocaleString() : '';
        html += `
            <div class="recent-item" data-filename="${escapeHtml(item.filename)}">
                <span class="recent-item-name">${escapeHtml(item.filename)}</span>
                <span class="recent-item-date">${date}</span>
            </div>`;
    }
    html += `<div class="recent-footer"><button class="outline secondary small" id="btn-clear-recent">Clear</button></div>`;
    
    dropdown.innerHTML = html;
    
    // Add click handlers for items
    dropdown.querySelectorAll('.recent-item').forEach(el => {
        el.addEventListener('click', async () => {
            const filename = el.dataset.filename;
            dropdown.classList.add('hidden');
            openRecentFile(filename);
        });
    });
    
    // Clear button
    dropdown.querySelector('#btn-clear-recent')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await clearRecent();
        dropdown.classList.add('hidden');
        document.getElementById('btn-recent').disabled = true;
    });
}

/**
 * Open a recently opened file
 * @param {string} filename
 */
async function openRecentFile(filename) {
    // Try to open from IndexedDB auto-save first
    const autoSaved = await getAutoSave();
    if (autoSaved && autoSaved.originalFilename === filename) {
        // Restore from auto-save
        state.filename = autoSaved.originalFilename;
        state.handle = null;
        state.text = autoSaved.text;
        
        try {
            state.area = parseFile(autoSaved.text);
        } catch (e) {
            console.error('Parse error:', e);
            alert(`Failed to parse file: ${e.message}`);
            return;
        }
        
        clearSelection();
        closeAllTabs();
        undoManager.clear();
        renderTree(state.area);
        runValidation(state.area);
        startAutoSave(state.filename, getCurrentText);
        markDirty();
        updateStatusBar();
        updateTitle();
        showWelcome(false);
        return;
    }
    
    // Otherwise prompt user to select the file
    showMessage(`Please select "${filename}" to open it`, 'info');
    handleOpen();
}

// Snapshot tracking for undo - stores entity state when form opens
const entitySnapshots = new Map();

/**
 * Create a snapshot of an entity for undo comparison
 * @param {string} key - Unique key (e.g., 'mob-1000', 'help-0')
 * @param {Object} entity - Entity to snapshot
 * @param {string} entityType - Type of entity
 */
function createSnapshot(key, entity, entityType) {
    // Deep clone the entity for comparison
    entitySnapshots.set(key, {
        entity,
        entityType,
        snapshot: JSON.parse(JSON.stringify(entity))
    });
}

/**
 * Get the snapshot for an entity
 * @param {string} key
 * @returns {Object|null}
 */
function getSnapshot(key) {
    return entitySnapshots.get(key) || null;
}

/**
 * Remove a snapshot
 * @param {string} key
 */
function removeSnapshot(key) {
    entitySnapshots.delete(key);
}

/**
 * Compare entity to its snapshot and record changes as undo actions
 * @param {string} key - Snapshot key
 * @param {string} sourceTabId - Tab that triggered the change
 */
function recordChangesFromSnapshot(key, sourceTabId) {
    const data = entitySnapshots.get(key);
    if (!data) return;
    
    const { entity, entityType, snapshot } = data;
    
    // Compare each field
    for (const field of Object.keys(entity)) {
        const oldVal = snapshot[field];
        const newVal = entity[field];
        
        // Skip functions, undefined, and unchanged values
        if (typeof newVal === 'function') continue;
        if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;
        
        // Determine entity VNum or identifier
        let entityVNum = entity.VNum || 0;
        if (entityType === 'help') {
            entityVNum = state.area.helps.indexOf(entity);
        }
        
        undoManager.push({
            type: ActionType.FIELD_EDIT,
            entityType,
            entityVNum,
            field,
            oldValue: JSON.parse(JSON.stringify(oldVal)),
            newValue: JSON.parse(JSON.stringify(newVal))
        });
    }
    
    // Update snapshot to current state (so next change compares from here)
    data.snapshot = JSON.parse(JSON.stringify(entity));
}

/**
 * Undo the last action
 */
function handleUndo() {
    const action = undoManager.undo();
    if (!action) {
        showMessage('Nothing to undo', 'info');
        return;
    }
    
    undoManager.enabled = false; // Prevent undo action from being recorded
    
    try {
        switch (action.type) {
            case ActionType.FIELD_EDIT: {
                // Find the entity
                const entity = findEntity(action.entityType, action.entityVNum);
                if (entity) {
                    entity[action.field] = action.oldValue;
                    refreshEntityAfterUndo(action.entityType, action.entityVNum);
                }
                break;
            }
            case ActionType.ENTITY_ADD: {
                // Undo add = remove the entity
                const arr = getEntityArray(action.entityType);
                if (arr) {
                    const idx = arr.findIndex(e => e.VNum === action.entityVNum);
                    if (idx !== -1) arr.splice(idx, 1);
                }
                refreshTree();
                break;
            }
            case ActionType.ENTITY_DELETE: {
                // Undo delete = re-add the entity
                const arr = getEntityArray(action.entityType);
                if (arr) {
                    arr.push(action.entity);
                }
                refreshTree();
                break;
            }
            case ActionType.BULK: {
                // Undo bulk = undo each action in reverse
                for (let i = action.actions.length - 1; i >= 0; i--) {
                    const sub = action.actions[i];
                    if (sub.type === ActionType.FIELD_EDIT) {
                        const entity = findEntity(sub.entityType, sub.entityVNum);
                        if (entity) entity[sub.field] = sub.oldValue;
                    } else if (sub.type === ActionType.ENTITY_ADD) {
                        const arr = getEntityArray(sub.entityType);
                        if (arr) {
                            const idx = arr.findIndex(e => e.VNum === sub.entityVNum);
                            if (idx !== -1) arr.splice(idx, 1);
                        }
                    } else if (sub.type === ActionType.ENTITY_DELETE) {
                        const arr = getEntityArray(sub.entityType);
                        if (arr) arr.push(sub.entity);
                    }
                }
                refreshTree();
                break;
            }
        }
        
        markDirty();
        showMessage(`Undo: ${describeAction(action)}`, 'info');
        
    } finally {
        undoManager.enabled = true;
    }
}

/**
 * Redo the last undone action
 */
function handleRedo() {
    const action = undoManager.redo();
    if (!action) {
        showMessage('Nothing to redo', 'info');
        return;
    }
    
    undoManager.enabled = false;
    
    try {
        switch (action.type) {
            case ActionType.FIELD_EDIT: {
                const entity = findEntity(action.entityType, action.entityVNum);
                if (entity) {
                    entity[action.field] = action.newValue;
                    refreshEntityAfterUndo(action.entityType, action.entityVNum);
                }
                break;
            }
            case ActionType.ENTITY_ADD: {
                const arr = getEntityArray(action.entityType);
                if (arr) arr.push(action.entity);
                refreshTree();
                break;
            }
            case ActionType.ENTITY_DELETE: {
                const arr = getEntityArray(action.entityType);
                if (arr) {
                    const idx = arr.findIndex(e => e.VNum === action.entityVNum);
                    if (idx !== -1) arr.splice(idx, 1);
                }
                refreshTree();
                break;
            }
            case ActionType.BULK: {
                for (const sub of action.actions) {
                    if (sub.type === ActionType.FIELD_EDIT) {
                        const entity = findEntity(sub.entityType, sub.entityVNum);
                        if (entity) entity[sub.field] = sub.newValue;
                    } else if (sub.type === ActionType.ENTITY_ADD) {
                        const arr = getEntityArray(sub.entityType);
                        if (arr) arr.push(sub.entity);
                    } else if (sub.type === ActionType.ENTITY_DELETE) {
                        const arr = getEntityArray(sub.entityType);
                        if (arr) {
                            const idx = arr.findIndex(e => e.VNum === sub.entityVNum);
                            if (idx !== -1) arr.splice(idx, 1);
                        }
                    }
                }
                refreshTree();
                break;
            }
        }
        
        markDirty();
        showMessage(`Redo: ${describeAction(action)}`, 'info');
        
    } finally {
        undoManager.enabled = true;
    }
}

/**
 * Find an entity by type and VNum
 * @param {string} entityType
 * @param {number} vnum
 * @returns {Object|null}
 */
function findEntity(entityType, vnum) {
    if (!state.area) return null;
    switch (entityType) {
        case 'mob': return getMobByVNum(state.area.mobs, vnum);
        case 'object': return getObjByVNum(state.area.objs, vnum);
        case 'room': return getRoomByVNum(state.area.rooms, vnum);
        case 'area': return state.area.general;
        case 'help': return state.area.helps[vnum]; // vnum is index for helps
        default: return null;
    }
}

/**
 * Get the array for an entity type
 * @param {string} entityType
 * @returns {Array|null}
 */
function getEntityArray(entityType) {
    if (!state.area) return null;
    switch (entityType) {
        case 'mob': return state.area.mobs;
        case 'object': return state.area.objs;
        case 'room': return state.area.rooms;
        case 'help': return state.area.helps;
        default: return null;
    }
}

/**
 * Refresh entity UI after undo/redo
 * @param {string} entityType
 * @param {number} vnum
 */
function refreshEntityAfterUndo(entityType, vnum) {
    // Determine node ID
    let nodeId;
    if (entityType === 'help') {
        nodeId = `help-${vnum}`;
    } else {
        nodeId = `${entityType}-${vnum}`;
    }
    
    // Find the entity
    const entity = findEntity(entityType, vnum);
    if (!entity) return;
    
    // Update tree label
    const newLabel = getEntityLabel(entity, entityType);
    updateNodeLabel(nodeId, newLabel);
    
    // Update tab label if open
    if (hasTab(nodeId)) {
        renameTab(nodeId, newLabel);
    }
    
    // Update input values in the form WITHOUT re-rendering (preserves tab state)
    updateFormValues(entityType, entity);
    
    // Update snapshot to current state
    createSnapshot(nodeId, entity, entityType);
}

/**
 * Update input values in a form without re-rendering
 * This preserves internal tab state and scroll position
 * @param {string} entityType
 * @param {Object} entity
 */
function updateFormValues(entityType, entity) {
    // Find the active tab content container
    const tabContent = document.querySelector('.tab-content.active');
    if (!tabContent) return;
    
    // Update each input/select/textarea that matches an entity field
    tabContent.querySelectorAll('input, select, textarea').forEach(el => {
        const name = el.name;
        if (!name) return;
        
        // Handle exit fields: exit_fieldname_index
        if (name.startsWith('exit_')) {
            const parts = name.split('_');
            const field = parts[1];
            const idx = parseInt(parts[2], 10);
            if (entity.doors && entity.doors[idx]) {
                const door = entity.doors[idx];
                if (field === 'vnumto') el.value = door.VNumTo;
                else if (field === 'keyvnum') el.value = door.keyVNum;
                else if (field === 'keywords') el.value = door.keywords || '';
                else if (field === 'descr') el.value = door.descr || '';
                else if (field === 'resettype') el.value = door.resetType;
                else if (field === 'reverse') el.checked = door.reverse;
            }
            return;
        }
        
        // Handle extra description fields: extra_kw_index, extra_descr_index
        if (name.startsWith('extra_')) {
            const parts = name.split('_');
            const idx = parseInt(parts[2], 10);
            if (entity.extraDescr && entity.extraDescr[idx]) {
                if (parts[1] === 'kw') el.value = entity.extraDescr[idx].keywords || '';
                else el.value = entity.extraDescr[idx].descr || '';
            }
            return;
        }
        
        // Handle standard entity fields
        const value = entity[name];
        if (value === undefined) return;
        
        if (el.type === 'checkbox') {
            el.checked = !!value;
        } else if (el.type === 'number') {
            el.value = value;
        } else {
            el.value = value;
        }
    });
}

/**
 * Refresh tree after undo/redo
 */
function refreshTree() {
    if (state.area) {
        renderTree(state.area);
    }
}

/**
 * Describe an action for display
 * @param {Object} action
 * @returns {string}
 */
/**
 * Mark area as dirty (modified)
 */
function markDirty() {
    if (!state.modified) {
        state.modified = true;
        updateTitle();
    }
    
    // Trigger auto-save after short delay (debounced)
    if (dirtyTimeout) clearTimeout(dirtyTimeout);
    dirtyTimeout = setTimeout(() => {
        if (state.area && state.filename) {
            const text = serializeFile(state.area);
            autoSave(state.filename, text);
        }
    }, 5000); // Save 5 seconds after last change
}

/**
 * Mark area as clean (saved)
 */
function markClean() {
    state.modified = false;
    updateTitle();
}

/**
 * Update window title with dirty indicator
 */
function updateTitle() {
    const base = 'EditIt (beta)';
    const file = state.filename ? ` - ${state.filename}` : '';
    const dirty = state.modified ? '*' : '';
    document.title = `${base}${file}${dirty}`;
}

/**
 * Centralized entity change handler
 * Call this whenever an entity is modified from any form.
 * Handles: dirty state, tree label, tab label, and cross-form refresh.
 * @param {Object} entity - The modified entity
 * @param {string} entityType - 'mob', 'object', 'room', 'help'
 * @param {string} [sourceTabId] - Tab ID of the form that made the change (to skip refreshing itself)
 */
function onEntityChange(entity, entityType, sourceTabId = null) {
    markDirty();
    updateStatusBar();
    
    // Determine node IDs
    let nodeId;
    if (entityType === 'help') {
        const index = state.area.helps.indexOf(entity);
        nodeId = `help-${index}`;
    } else {
        nodeId = `${entityType}-${entity.VNum}`;
    }
    
    // Update tree label
    const newLabel = getEntityLabel(entity, entityType);
    updateNodeLabel(nodeId, newLabel);
    
    // Update tab label if this tab is open
    if (hasTab(nodeId) && nodeId !== sourceTabId) {
        renameTab(nodeId, newLabel);
    }
    
    // Cross-refresh: check all open tabs and refresh any that show this entity
    const tabsToRefresh = [];
    
    if (entityType === 'mob') {
        // Mobile changed - check if shop or specials tabs need refresh
        if (entity.isShopKeeper && hasTab(`shop-${entity.VNum}`) && sourceTabId !== `shop-${entity.VNum}`) {
            tabsToRefresh.push({ id: `shop-${entity.VNum}`, type: 'shop' });
        }
        // Always check specials if mob tab is open
        if (hasTab('specials') && sourceTabId !== 'specials') {
            tabsToRefresh.push({ id: 'specials', type: 'specials' });
        }
        // Also refresh the mob tab if changed from shop form
        if (hasTab(`mob-${entity.VNum}`) && sourceTabId !== `mob-${entity.VNum}`) {
            tabsToRefresh.push({ id: `mob-${entity.VNum}`, type: 'mob' });
        }
    }
    
    // Perform refreshes
    for (const tab of tabsToRefresh) {
        refreshTab(tab.id, (content) => renderTabContent(content, tab.type, tab.id));
    }
    
    // Refresh tree if mob's shop or special status may have changed
    if (entityType === 'mob') {
        renderTree(state.area);
    }
    
    // Refresh stats panel for this entity type if open
    const statsTabId = `${entityType === 'mob' ? 'mobs' : entityType === 'object' ? 'objects' : entityType === 'room' ? 'rooms' : 'helps'}-stats`;
    if (hasTab(statsTabId) && sourceTabId !== statsTabId) {
        const categoryType = entityType === 'mob' ? 'mobs' : entityType === 'object' ? 'objects' : entityType === 'room' ? 'rooms' : 'helps';
        refreshTab(statsTabId, (content) => {
            content.appendChild(renderStatsPanel(categoryType, state.area));
        });
    }
}

/**
 * Get display label for an entity
 */
function getEntityLabel(entity, entityType) {
    switch (entityType) {
        case 'mob':
        case 'object':
        case 'room':
            const name = entity.shortDescr || entity.name || '';
            return name ? `#${entity.VNum} - ${name}` : `#${entity.VNum}`;
        case 'help':
            return `[${entity.level}] ${entity.keywords || ''}`;
        default:
            return `#${entity.VNum}`;
    }
}

/**
 * Render error fallback in a tab
 */
function renderTabError(container, error, context) {
    console.error(`Error rendering ${context}:`, error);
    container.innerHTML = `
        <div style="padding: 1rem; color: var(--pico-del-color);">
            <h4>⚠ Error rendering ${context}</h4>
            <p>${error.message || 'Unknown error'}</p>
            <p style="font-size: 0.85rem; color: var(--pico-muted-color);">${error.stack || ''}</p>
        </div>
    `;
}

/**
 * Render tab content by type
 */
function renderTabContent(container, type, tabId) {
    try {
        switch (type) {
            case 'mob': {
                const vnum = parseInt(tabId.replace('mob-', ''), 10);
                const mob = getMobByVNum(state.area.mobs, vnum);
                if (mob) {
                    createSnapshot(tabId, mob, 'mob');
                    container.appendChild(renderMobileForm(mob, (m) => {
                        recordChangesFromSnapshot(tabId, tabId);
                        onEntityChange(m, 'mob', tabId);
                    }));
                } else {
                    renderTabError(container, new Error(`Mobile #${vnum} not found`), 'mob');
                }
                break;
            }
            case 'shop': {
                const vnum = parseInt(tabId.replace('shop-', ''), 10);
                const mob = getMobByVNum(state.area.mobs, vnum);
                if (mob) {
                    createSnapshot(`mob-${vnum}`, mob, 'mob');
                    container.appendChild(renderShopForm(mob, (m) => {
                        recordChangesFromSnapshot(`mob-${vnum}`, tabId);
                        onEntityChange(m, 'mob', tabId);
                    }, { mobs: state.area?.mobs || [] }));
                } else {
                    renderTabError(container, new Error(`Mobile #${vnum} not found`), 'shop');
                }
                break;
            }
            case 'object': {
                const vnum = parseInt(tabId.replace('obj-', ''), 10);
                const obj = getObjByVNum(state.area.objs, vnum);
                if (obj) {
                    createSnapshot(tabId, obj, 'object');
                    container.appendChild(renderObjectForm(obj, (o) => {
                        recordChangesFromSnapshot(tabId, tabId);
                        onEntityChange(o, 'object', tabId);
                    }));
                } else {
                    renderTabError(container, new Error(`Object #${vnum} not found`), 'object');
                }
                break;
            }
            case 'room': {
                const vnum = parseInt(tabId.replace('room-', ''), 10);
                const room = getRoomByVNum(state.area.rooms, vnum);
                if (room) {
                    createSnapshot(tabId, room, 'room');
                    container.appendChild(renderRoomForm(room, (r) => {
                        recordChangesFromSnapshot(tabId, tabId);
                        onEntityChange(r, 'room', tabId);
                    }, { area: state.area }));
                } else {
                    renderTabError(container, new Error(`Room #${vnum} not found`), 'room');
                }
                break;
            }
            case 'help': {
                const index = parseInt(tabId.replace('help-', ''), 10);
                const help = state.area.helps[index];
                if (help) {
                    createSnapshot(tabId, help, 'help');
                    container.appendChild(renderHelpForm(help, (h) => {
                        recordChangesFromSnapshot(tabId, tabId);
                        onEntityChange(h, 'help', tabId);
                    }).container);
                } else {
                    renderTabError(container, new Error(`Help entry #${index} not found`), 'help');
                }
                break;
            }
            case 'specials': {
                container.appendChild(renderSpecialsPanel(state.area, (mob) => {
                    if (mob) {
                        onEntityChange(mob, 'mob', 'specials');
                    } else {
                        markDirty();
                        updateStatusBar();
                        renderTree(state.area);
                    }
                }));
                break;
            }
            case 'resets': {
                container.appendChild(renderResetPanel(state.area, () => {
                    markDirty();
                    updateStatusBar();
                }));
                break;
            }
        }
    } catch (error) {
        renderTabError(container, error, type);
    }
}

/**
 * Get current text for auto-save
 * @returns {string}
 */
function getCurrentText() {
    // Return serialized version of current state, not original text
    if (state.area) {
        return serializeFile(state.area);
    }
    return state.text;
}

/**
 * Update button states based on whether area is loaded
 */
function updateButtonStates() {
    const hasArea = state.area !== null;
    
    // Both Save and Download enabled when area is loaded
    document.getElementById('btn-save').disabled = !hasArea;
    document.getElementById('btn-download').disabled = !hasArea;
    document.getElementById('btn-validate').disabled = !hasArea;
    document.getElementById('btn-map').disabled = !hasArea;
}

/**
 * Update status bar
 */
function updateStatusBar() {
    const fileEl = document.getElementById('status-file');
    const infoEl = document.getElementById('status-info');
    
    if (state.filename) {
        fileEl.textContent = state.filename;
        
        const parts = [];
        if (state.area) {
            parts.push(`${state.area.rooms.length} rooms`);
            parts.push(`${state.area.mobs.length} mobs`);
            parts.push(`${state.area.objs.length} objects`);
        }
        if (state.selectedNode) {
            parts.push(`Selected: ${state.selectedNode.type}`);
        }
        infoEl.textContent = parts.join(' | ');
    } else {
        fileEl.textContent = 'No file open';
        infoEl.textContent = '';
    }
    
    updateButtonStates();
}

/**
 * Show/hide welcome message
 * @param {boolean} show 
 */
function showWelcome(show) {
    const welcome = document.getElementById('welcome-message');
    if (welcome) {
        welcome.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show a temporary status message
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showMessage(message, type = 'success') {
    showToast(message, type, 3000);
}

function showCorruptBackup(corrupt) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <h3>Corrupt Backup Found</h3>
            <p>File: <strong>${escapeHtml(corrupt.originalFilename)}</strong></p>
            <p>Error: ${escapeHtml(corrupt.error || 'unknown')}</p>
            <p>You can copy the text below, create a new file, and paste it to recover:</p>
            <textarea readonly style="width:100%; height:300px; font-family:monospace; font-size:12px;">${escapeHtml(corrupt.text || '')}</textarea>
            <div style="display:flex; gap:8px; margin-top:12px; justify-content:flex-end;">
                <button id="corrupt-copy">Copy to Clipboard</button>
                <button id="corrupt-dismiss">Dismiss</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#corrupt-copy').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(corrupt.text);
            showMessage('Copied to clipboard', 'success');
        } catch {
            showMessage('Copy failed — select text manually', 'warning');
        }
    });
    overlay.querySelector('#corrupt-dismiss').addEventListener('click', async () => {
        overlay.remove();
        await dbDelete('areas', 'corrupt');
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.querySelector('#corrupt-dismiss').click();
    });
}

/**
 * Open file handler
 */
async function handleOpen() {
    try {
        const result = await openFile();
        if (!result) return;
        
        // Update state
        state.filename = result.filename;
        state.handle = result.handle;
        state.text = result.text;
        markClean();
        
        // Parse in next frame to avoid blocking UI
        await new Promise(resolve => requestAnimationFrame(resolve));
        state.area = parseFile(result.text);
        
        // Clear previous selection and tabs
        clearSelection();
        closeAllTabs();
        undoManager.clear(); // Clear undo history for new file
        
        // Render tree
        renderTree(state.area);
        
        // Run validation
        runValidation(state.area);
        
        // Add to recent
        await addRecent(state.filename);
        document.getElementById('btn-recent').disabled = false;
        
        // Start auto-save
        startAutoSave(state.filename, getCurrentText);
        
        // Update UI
        updateStatusBar();
        updateTitle();
        showWelcome(false);
        
        if (DEBUG) console.log(`Opened: ${state.filename}`);
        if (DEBUG) console.log(`  Area: ${state.area.general.areaName}`);
        if (DEBUG) console.log(`  Rooms: ${state.area.rooms.length}`);
        if (DEBUG) console.log(`  Mobiles: ${state.area.mobs.length}`);
        if (DEBUG) console.log(`  Objects: ${state.area.objs.length}`);
        
    } catch (error) {
        console.error('Open failed:', error);
        showParseError(error);
    }
}

/**
 * Show detailed parse error dialog
 */
function showParseError(error, fileText) {
    const message = error.message || 'Unknown error';
    
    // Extract line number from error message
    const lineMatch = message.match(/line\s+(\d+)/i);
    const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : null;
    
    // Get context lines if we have the file text
    let contextHtml = '';
    if (fileText && lineNum) {
        const lines = fileText.split('\n');
        const start = Math.max(0, lineNum - 3);
        const end = Math.min(lines.length, lineNum + 2);
        
        contextHtml = '<div class="error-context">';
        for (let i = start; i < end; i++) {
            const lineNumDisplay = i + 1;
            const isTarget = i + 1 === lineNum;
            const lineContent = escapeHtml(lines[i] || '');
            contextHtml += `<div class="error-line${isTarget ? ' error-line-target' : ''}">`;
            contextHtml += `<span class="error-line-num">${lineNumDisplay}</span>`;
            contextHtml += `<span class="error-line-content">${lineContent || '&nbsp;'}</span>`;
            contextHtml += '</div>';
        }
        contextHtml += '</div>';
    }
    
    // Suggest common fixes
    let suggestions = '';
    if (message.includes('EOF')) {
        suggestions = '<p class="error-suggestion">💡 The file may be truncated or missing closing characters.</p>';
    } else if (message.includes("'~'") || message.includes('ReadString')) {
        suggestions = '<p class="error-suggestion">💡 Check for missing ~ (tilde) at the end of a string field.</p>';
    } else if (message.includes('section') || message.includes('#')) {
        suggestions = '<p class="error-suggestion">💡 Check for malformed section headers (e.g., #MOBILES, #OBJECTS).</p>';
    }
    
    const dialog = document.createElement('dialog');
    dialog.className = 'error-dialog';
    dialog.innerHTML = `
        <article>
            <header>
                <button class="close" onclick="this.closest('dialog').close()"></button>
                <h3 style="color: var(--pico-del-color);">⚠ Parse Error</h3>
            </header>
            <div class="error-message">${escapeHtml(message)}</div>
            ${contextHtml}
            ${suggestions}
            <footer>
                <button class="secondary" onclick="this.closest('dialog').close()">Close</button>
            </footer>
        </article>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.addEventListener('close', () => dialog.remove());
}

/**
 * Save file handler
 */
async function handleSave() {
    if (!state.area) {
        if (DEBUG) console.log('No area loaded');
        return;
    }
    
    // Run validation if auto-validate is enabled
    if (shouldAutoValidate()) {
        const issues = validateAll(state.area);
        if (hasBlockingErrors(issues)) {
            const proceed = confirm(
                `Area has ${issues.filter(i => i.severity === 'error').length} error(s).\n` +
                `Save anyway?`
            );
            if (!proceed) {
                runValidation(state.area);
                return;
            }
        }
    }
    
    try {
        const text = serializeFile(state.area);
        
        // If no handle, prompt user to select file to save to
        if (!state.handle && hasFileSystemAccess()) {
            const result = await promptFileForSave(state.filename || 'new_area.are');
            if (!result) return; // User cancelled
            state.handle = result.handle;
            state.filename = result.filename;
            updateTitle();
        }
        
        const filename = state.filename || 'new_area.are';
        const success = await saveFile(state.handle, filename, text);
        
        if (success) {
            state.text = text;
            markClean();
            updateStatusBar();
            showMessage('File saved successfully', 'success');
            if (DEBUG) console.log(`Saved: ${state.filename}`);
            
            // Clear auto-save since we just saved to file
            await clearAutoSave();
            if (DEBUG) console.log('Auto-save cleared after successful save');
            
            // Verify by reading back
            try {
                const file = await state.handle.getFile();
                const content = await file.text();
                const rooms = (content.match(/^#\d+/gm) || []).length;
                if (DEBUG) console.log('Verify: File on disk has', content.length, 'bytes,', rooms, 'room vnums');
                if (DEBUG) console.log('Verify: First 200 chars:', content.substring(0, 200));
            } catch (e) {
                console.error('Verify failed:', e);
            }
        }
        
    } catch (error) {
        console.error('Save failed:', error);
        alert(`Failed to save file: ${error.message}`);
    }
}

/**
 * Prompt user to select file for saving
 * @param {string} suggestedFilename - Suggested filename
 * @returns {Promise<{handle: FileSystemFileHandle, filename: string} | null>}
 */
async function promptFileForSave(suggestedFilename) {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: suggestedFilename,
            types: [
                {
                    description: 'Area Files',
                    accept: { 'text/plain': ['.are'] }
                }
            ]
        });
        
        if (DEBUG) console.log('promptFileForSave: Got handle for', handle.name);
        if (DEBUG) console.log('promptFileForSave: Handle permissions:', await handle.queryPermission({ mode: 'readwrite' }));
        return { handle, filename: handle.name };
    } catch (error) {
        if (error.name === 'AbortError') {
            return null; // User cancelled
        }
        throw error;
    }
}

/**
 * Download file handler
 */
function handleDownload() {
    if (!state.area) {
        if (DEBUG) console.log('No area loaded');
        return;
    }
    
    try {
        const text = serializeFile(state.area);
        const filename = state.filename || 'new_area.are';
        
        // Create blob and download
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        if (DEBUG) console.log(`Downloaded: ${filename}`);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Failed to download file: ${error.message}`);
    }
}

/**
 * Validate handler
 */
function handleValidate() {
    if (!state.area) {
        return;
    }
    runValidation(state.area);
}

/**
 * Handle map button
 */
function handleMap() {
    if (!state.area) return;
    if (isMapOpen()) {
        closeMap();
    } else {
        openMap(state.area);
    }
}

/**
 * Handle new file
 */
function handleNew() {
    if (state.modified) {
        if (!confirm('Unsaved changes will be lost. Continue?')) {
            return;
        }
    }
    
    // Stop auto-save if running
    stopAutoSave();
    
    // Create new empty area
    state.filename = 'untitled.are';
    state.handle = null;
    state.text = null;
    state.area = {
        general: createArea(),
        helps: [],
        mobs: [],
        objs: [],
        rooms: []
    };
    markClean();
    
    // Clear UI and render empty tree
    clearSelection();
    closeAllTabs();
    undoManager.clear(); // Clear undo history for new file
    renderTree(state.area);
    
    // Update UI
    updateStatusBar();
    showWelcome(false);
    updateTitle();
    
    // Hide validation panel
    document.getElementById('validation-panel')?.classList.add('hidden');
    
    // Start auto-save for new area
    startAutoSave(state.filename, getCurrentText);
    
    showMessage('New area created', 'info');
}

/**
 * Handle tree node selection
 * @param {Object} node - Selected tree node
 */
function handleNodeSelection(node) {
    state.selectedNode = node;
    
    if (!node) {
        state.activeTab = null;
        updateStatusBar();
        return;
    }
    
    // Skip category nodes (except resets and specials)
    if (node.type === 'category') {
        if (node.id === 'resets') {
            // Open resets panel
            const tabId = 'resets';
            if (!hasTab(tabId)) {
                if (isMaxTabsReached()) {
                    showMessage(`Maximum of ${getMaxTabs()} tabs reached.`, 'error');
                    return;
                }
                const content = createTab(tabId, 'Resets', '🔄');
                if (content) {
                    content.appendChild(renderResetPanel(state.area, () => {
                        markDirty();
                        updateStatusBar();
                    }));
                }
            } else {
                showTab(tabId);
            }
            state.activeTab = tabId;
        } else if (node.id === 'specials') {
            // Open specials panel
            const tabId = 'specials';
            if (!hasTab(tabId)) {
                if (isMaxTabsReached()) {
                    showMessage(`Maximum of ${getMaxTabs()} tabs reached.`, 'error');
                    return;
                }
                const content = createTab(tabId, 'Specials', '✨');
                if (content) {
                    content.appendChild(renderSpecialsPanel(state.area, (mob) => {
                        if (mob) {
                            onEntityChange(mob, 'mob', 'specials');
                        } else {
                            markDirty();
                            updateStatusBar();
                            renderTree(state.area);
                        }
                    }));
                }
            } else {
                showTab(tabId);
            }
            state.activeTab = tabId;
        } else if (['rooms', 'mobs', 'objects', 'helps', 'shops'].includes(node.id)) {
            // Open stats panel
            const tabId = `${node.id}-stats`;
            const icons = { rooms: '🚪', mobs: '👤', objects: '📦', helps: '❓' };
            const labels = { rooms: 'Rooms', mobs: 'Mobiles', objects: 'Objects', helps: 'Helps', shops: 'Shops' };
            const renderFn = (content) => {
                content.appendChild(renderStatsPanel(node.id, state.area));
            };
            
            if (!hasTab(tabId)) {
                if (isMaxTabsReached()) {
                    showMessage(`Maximum of ${getMaxTabs()} tabs reached.`, 'error');
                    return;
                }
                const content = createTab(tabId, labels[node.id] + ' Stats', icons[node.id]);
                if (content) {
                    renderFn(content);
                }
            } else {
                refreshTab(tabId, renderFn);
                showTab(tabId);
            }
            state.activeTab = tabId;
        }
        updateStatusBar();
        return;
    }
    
    // Create or show tab for this node
    const tabId = node.id;
    
    if (!hasTab(tabId)) {
        // Check max tabs
        if (isMaxTabsReached()) {
            showMessage(`Maximum of ${getMaxTabs()} tabs reached. Close some tabs to open more.`, 'error');
            return;
        }
        
        const icon = TYPE_ICONS[node.type] || '';
        const content = createTab(tabId, node.label, icon);
        
        if (content === null) {
            showMessage(`Maximum of ${getMaxTabs()} tabs reached. Close some tabs to open more.`, 'error');
            return;
        }
        
        renderForm(content, node);
    } else {
        showTab(tabId);
    }
    
    state.activeTab = tabId;
    updateStatusBar();
}

/**
 * Handle context menu action
 * @param {string} action - Action type
 * @param {string} nodeId - Node id
 */
function handleContextAction(action, nodeId) {
    if (DEBUG) console.log(`Context action: ${action} on ${nodeId}`);
    
    const node = getNode(nodeId);
    if (!node) return;
    
    switch (action) {
        case 'add':
            handleAddAction(node);
            break;
        case 'delete':
            handleDeleteAction(node);
            break;
        case 'duplicate':
            handleDuplicateAction(node);
            break;
        default:
            console.warn(`Unknown action: ${action}`);
    }
}

/**
 * Handle add action based on parent node type
 * @param {Object} node - Node to add child to
 */
function handleAddAction(node) {
    // Determine what type to add based on the node
    let typeToAdd = node.type;
    if (node.type === 'category') {
        typeToAdd = node.id; // e.g., 'helps', 'rooms', etc.
    }
    
    switch (typeToAdd) {
        case 'help':
        case 'helps':
            addEntity('help');
            break;
        case 'room':
        case 'rooms':
            addEntity('room');
            break;
        case 'mob':
        case 'mobs':
            addEntity('mob');
            break;
        case 'object':
        case 'objects':
            addEntity('object');
            break;
        case 'resets':
            alert('Adding resets is done from the Reset panel.');
            break;
        default:
            alert(`Add action for '${typeToAdd}' not implemented.`);
    }
}

/**
 * Entity type configuration for addEntity.
 * Each entry: { factory, treeParent, getArray, getId, labelFn }
 */
const ENTITY_CONFIG = {
    help:   { factory: createHelp,   treeParent: 'helps',   getArray: a => a.helps,   getId: (e, a) => `help-${a.helps.length}`,   labelFn: e => `[${e.level}] ${e.keywords || 'new help'}` },
    object: { factory: createObject, treeParent: 'objects', getArray: a => a.objs,    getId: (e) => `obj-${e.VNum}`,               labelFn: e => getEntityLabel(e, 'object') },
    mob:    { factory: createMobile, treeParent: 'mobs',    getArray: a => a.mobs,    getId: (e) => `mob-${e.VNum}`,               labelFn: e => getEntityLabel(e, 'mob') },
    room:   { factory: createRoom,   treeParent: 'rooms',   getArray: a => a.rooms,   getId: (e) => `room-${e.VNum}`,              labelFn: e => getEntityLabel(e, 'room') },
};

/**
 * Add a new entity of the given type.
 * @param {'help'|'object'|'mob'|'room'} entityType
 */
function addEntity(entityType) {
    if (!state.area) return;
    const cfg = ENTITY_CONFIG[entityType];
    if (!cfg) return;
    
    const entity = cfg.factory();
    if (entityType !== 'help') {
        entity.VNum = findNextVNum(cfg.getArray(state.area), state.area.general.VNumStart);
    }
    cfg.getArray(state.area).push(entity);
    
    // Record for undo
    undoManager.push({
        type: ActionType.ENTITY_ADD,
        entityType,
        entityVNum: entityType === 'help' ? cfg.getArray(state.area).length - 1 : entity.VNum,
        entity: JSON.parse(JSON.stringify(entity))
    });
    
    const id = cfg.getId(entity, state.area);
    const node = {
        id,
        label: cfg.labelFn(entity),
        type: entityType,
        parent: cfg.treeParent,
        children: [],
        data: entity,
        expanded: false
    };
    
    addNode(node);
    markDirty();
    updateStatusBar();
    
    // Open tab after render
    setTimeout(() => {
        if (!hasTab(id)) {
            const icon = TYPE_ICONS[entityType] || '';
            const content = createTab(id, node.label, icon);
            if (content) renderForm(content, node);
        } else {
            showTab(id);
        }
    }, 50);
}

/**
 * Find next available VNum for a type
 * @param {Array} existing - Array of existing entities
 * @param {number} areaBaseVnum - Area's base VNum (from VNumStart)
 * @returns {number}
 */
function findNextVNum(existing, areaBaseVnum) {
    // Use area's base VNum if provided, minimum 1 (0 is reserved for section terminators)
    let baseVnum = Math.max(areaBaseVnum || 0, 1);
    
    // If no existing entities, start from baseVnum
    if (existing.length === 0) {
        return baseVnum;
    }
    
    // Find the minimum VNum in use
    const minVNum = Math.min(...existing.map(e => e.VNum));
    
    // Start from the higher of baseVnum or minVNum
    let vnum = Math.max(baseVnum, minVNum);
    
    // Find next available VNum
    const usedVNums = new Set(existing.map(e => e.VNum));
    while (usedVNums.has(vnum)) {
        vnum++;
    }
    return vnum;
}



/**
 * Handle delete action
 * @param {Object} node - Node to delete
 */
function handleDeleteAction(node) {
    // Don't delete category or root nodes
    if (node.type === 'category' || node.type === 'root' || node.type === 'area') {
        return;
    }
    
    if (!confirm(`Delete ${node.type}: ${node.label}?`)) {
        return;
    }
    
    // Determine entity type for undo
    let entityType = node.type;
    let entityVNum = node.data?.VNum || 0;
    let deletedEntity = null;
    
    // Remove from data model
    if (state.area) {
        if (node.type === 'help') {
            const index = state.area.helps.indexOf(node.data);
            if (index !== -1) {
                deletedEntity = JSON.parse(JSON.stringify(node.data));
                state.area.helps.splice(index, 1);
                entityVNum = index; // For helps, VNum is index
            }
        } else if (node.type === 'room') {
            const index = state.area.rooms.indexOf(node.data);
            if (index !== -1) {
                deletedEntity = JSON.parse(JSON.stringify(node.data));
                state.area.rooms.splice(index, 1);
            }
        } else if (node.type === 'mob') {
            const index = state.area.mobs.indexOf(node.data);
            if (index !== -1) {
                deletedEntity = JSON.parse(JSON.stringify(node.data));
                state.area.mobs.splice(index, 1);
            }
        } else if (node.type === 'object') {
            const index = state.area.objs.indexOf(node.data);
            if (index !== -1) {
                deletedEntity = JSON.parse(JSON.stringify(node.data));
                state.area.objs.splice(index, 1);
            }
        } else if (node.type === 'shop') {
            // Remove shop from mob, don't delete the mob
            node.data.isShopKeeper = 0;
            node.data.buyType = [0, 0, 0, 0, 0];
            entityType = 'mob';
        } else if (node.type === 'special') {
            // Remove special from mob, don't delete the mob
            node.data.special = '';
            entityType = 'mob';
        }
    }
    
    // Record delete for undo (only for entity types that can be restored)
    if (deletedEntity && ['room', 'mob', 'object', 'help'].includes(node.type)) {
        undoManager.push({
            type: ActionType.ENTITY_DELETE,
            entityType,
            entityVNum,
            entity: deletedEntity
        });
    }
    
    // Remove from tree
    removeNode(node.id);
    
    // Close tab if open
    if (hasTab(node.id)) {
        closeTab(node.id);
    }
    
    // Refresh affected tabs
    if (node.type === 'mob') {
        // Mobile deleted - refresh specials panel if open
        if (hasTab('specials')) {
            refreshTab('specials', (content) => {
                content.appendChild(renderSpecialsPanel(state.area, (mob) => {
                    if (mob) {
                        onEntityChange(mob, 'mob', 'specials');
                    } else {
                        markDirty();
                        updateStatusBar();
                        renderTree(state.area);
                    }
                }));
            });
        }
    } else if (node.type === 'shop') {
        // Shop cleared - refresh mob tab if open
        const mobNodeId = `mob-${node.data.VNum}`;
        if (hasTab(mobNodeId)) {
            refreshTab(mobNodeId, (content) => {
                renderTabContent(content, 'mob', mobNodeId);
            });
        }
    } else if (node.type === 'special') {
        // Special cleared - refresh mob tab if open
        const mobNodeId = `mob-${node.data.VNum}`;
        if (hasTab(mobNodeId)) {
            refreshTab(mobNodeId, (content) => {
                renderTabContent(content, 'mob', mobNodeId);
            });
        }
    }
    
    markDirty();
    updateStatusBar();
}

/**
 * Handle duplicate action
 * @param {Object} node - Node to duplicate
 */
function handleDuplicateAction(node) {
    // Don't duplicate category or root nodes
    if (node.type === 'category' || node.type === 'root' || node.type === 'area') {
        return;
    }
    
    if (!state.area) return;
    
    let copy = null;
    let newId = null;
    
    if (node.type === 'help') {
        copy = {
            level: node.data.level,
            keywords: node.data.keywords + ' (copy)',
            text: node.data.text
        };
        state.area.helps.push(copy);
        newId = `help-${state.area.helps.length - 1}`;
    } else if (node.type === 'room') {
        copy = JSON.parse(JSON.stringify(node.data));
        copy.VNum = findNextVNum(state.area.rooms, state.area.general.VNumStart);
        copy.name = copy.name ? copy.name + ' (copy)' : '';
        state.area.rooms.push(copy);
        newId = `room-${copy.VNum}`;
    } else if (node.type === 'mob') {
        copy = JSON.parse(JSON.stringify(node.data));
        copy.VNum = findNextVNum(state.area.mobs, state.area.general.VNumStart);
        copy.shortDescr = copy.shortDescr ? copy.shortDescr + ' (copy)' : '';
        state.area.mobs.push(copy);
        newId = `mob-${copy.VNum}`;
    } else if (node.type === 'object') {
        copy = JSON.parse(JSON.stringify(node.data));
        copy.VNum = findNextVNum(state.area.objs, state.area.general.VNumStart);
        copy.shortDescr = copy.shortDescr ? copy.shortDescr + ' (copy)' : '';
        state.area.objs.push(copy);
        newId = `obj-${copy.VNum}`;
    }
    
    if (copy && newId) {
        const newNode = {
            id: newId,
            label: getEntityLabel(copy, node.type),
            type: node.type,
            parent: node.parent,
            children: [],
            data: copy,
            expanded: false
        };
        
        addNode(newNode);
        markDirty();
        updateStatusBar();
        
        // Open the new entity
        setTimeout(() => {
            const tabId = newId;
            if (!hasTab(tabId)) {
                const icon = TYPE_ICONS[node.type] || '';
                const content = createTab(tabId, newNode.label, icon);
                if (content) {
                    renderForm(content, newNode);
                }
            } else {
                showTab(tabId);
            }
        }, 50);
    }
}

/**
 * Render form for a node
 * @param {HTMLElement} container - Content container
 * @param {Object} node - Tree node
 */
function renderForm(container, node) {
    switch (node.type) {
        case 'area': {
            createSnapshot('area', state.area.general, 'area');
            container.appendChild(renderAreaForm(state.area.general, (area) => {
                recordChangesFromSnapshot('area', node.id);
                markDirty();
                updateStatusBar();
                const newLabel = `🗺️ ${area.areaName || 'Unnamed Area'}`;
                updateNodeLabel('root', newLabel);
                renameTab('root', newLabel);
            }));
            break;
        }
            
        case 'help': {
            const key = `help-${state.area.helps.indexOf(node.data)}`;
            createSnapshot(key, node.data, 'help');
            container.appendChild(renderHelpForm(node.data, (help) => {
                recordChangesFromSnapshot(key, node.id);
                onEntityChange(help, 'help', node.id);
            }).container);
            break;
        }
            
        case 'room': {
            const key = `room-${node.data.VNum}`;
            createSnapshot(key, node.data, 'room');
            container.appendChild(renderRoomForm(node.data, (room) => {
                recordChangesFromSnapshot(key, node.id);
                onEntityChange(room, 'room', node.id);
            }, { area: state.area }));
            break;
        }
            
        case 'mob': {
            const key = `mob-${node.data.VNum}`;
            createSnapshot(key, node.data, 'mob');
            container.appendChild(renderMobileForm(node.data, (mob) => {
                recordChangesFromSnapshot(key, node.id);
                onEntityChange(mob, 'mob', node.id);
            }));
            break;
        }
            
        case 'object': {
            const key = `obj-${node.data.VNum}`;
            createSnapshot(key, node.data, 'object');
            container.appendChild(renderObjectForm(node.data, (obj) => {
                recordChangesFromSnapshot(key, node.id);
                onEntityChange(obj, 'object', node.id);
            }));
            break;
        }
            
        case 'resets':
            container.appendChild(renderResetPanel(state.area, () => {
                markDirty();
                updateStatusBar();
            }));
            break;
            
        case 'shop': {
            const key = `mob-${node.data.VNum}`;
            createSnapshot(key, node.data, 'mob');
            container.appendChild(renderShopForm(node.data, (mob) => {
                recordChangesFromSnapshot(key, node.id);
                onEntityChange(mob, 'mob', node.id);
            }, { mobs: state.area?.mobs || [] }));
            break;
        }
            
        case 'specials':
            container.appendChild(renderSpecialsPanel(state.area, (mob) => {
                if (mob) {
                    const key = `mob-${mob.VNum}`;
                    createSnapshot(key, mob, 'mob');
                    onEntityChange(mob, 'mob', 'specials');
                } else {
                    markDirty();
                    updateStatusBar();
                    renderTree(state.area);
                }
            }));
            break;
            
        default:
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--pico-muted-color);">
                    <h3>${node.label}</h3>
                    <p>Form for type '${node.type}' not implemented.</p>
                </div>
            `;
    }
}

/**
 * Check for auto-save on startup
 */
async function checkAutoSave() {
    const autoSaved = await getAutoSave();
    
    if (autoSaved) {
        const restore = confirm(
            `Found unsaved changes for "${autoSaved.originalFilename}".\n\n` +
            `Last modified: ${new Date(autoSaved.lastModified).toLocaleString()}\n\n` +
            `Restore?`
        );
        
        if (restore) {
            state.filename = autoSaved.originalFilename;
            state.handle = null; // Can't restore handle
            state.text = autoSaved.text;
            
            try {
                state.area = parseFile(autoSaved.text);
            } catch (e) {
                console.error('Auto-save parse error:', e.message);
                if (DEBUG) console.log('Auto-save text:', JSON.stringify(autoSaved.text));
                // Preserve corrupt auto-save for recovery
                await dbPut('areas', 'corrupt', {
                    filename: 'corrupt',
                    originalFilename: autoSaved.originalFilename,
                    text: autoSaved.text,
                    lastModified: autoSaved.lastModified,
                    error: e.message
                });
                // Start fresh
                state.area = {
                    general: createArea(),
                    helps: [],
                    mobs: [],
                    objs: [],
                    rooms: []
                };
                showMessage('Auto-save was corrupt (saved as backup), starting fresh', 'warning');
            }
            
            markDirty();
            
            // Render tree
            renderTree(state.area);
            
            // Add to recent
            await addRecent(state.filename);
            document.getElementById('btn-recent').disabled = false;
            
            startAutoSave(state.filename, getCurrentText);
            
            // Update UI
            updateStatusBar();
            updateButtonStates();
            updateTitle();
            showWelcome(false);
        } else {
            await clearAutoSave();
        }
    }
    
    // Check for corrupt backup
    const corrupt = await getCorruptAutoSave();
    if (corrupt && corrupt.originalFilename) {
        showCorruptBackup(corrupt);
    }
}

/**
 * Initialize application
 */
async function init() {
    if (DEBUG) console.log('EditIt initializing...');
    
    // Check browser support
    const support = checkBrowserSupport();
    if (DEBUG) console.log('Capabilities:', getCapabilities());
    
    if (support.issues.length > 0) {
        console.warn('Browser issues:', support.issues);
    }
    
    if (!support.supported) {
        alert('Your browser may not support all features. Please use Chrome or Edge for best experience.');
    }
    
    // Initialize database
    try {
        await initDB();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        alert('Failed to initialize storage. Auto-save and recent files may not work.');
    }
    
    // Warn if IndexedDB unavailable
    if (!hasIndexedDB()) {
        showMessage('Auto-save disabled: IndexedDB not available', 'error');
    }
    
    // Warn if File System Access unavailable
    if (!hasFileSystemAccess()) {
        if (DEBUG) console.log('File System Access API not available. Will use download fallback.');
    }
    
    // Initialize tree view
    const treeContainer = document.getElementById('tree');
    initTree(treeContainer, {
        onSelectionChange: handleNodeSelection,
        onContextAction: handleContextAction
    });
    
    // Initialize tabs
    const tabsContainer = document.getElementById('tabs');
    const contentContainer = document.getElementById('tab-content');
    initTabs(tabsContainer, contentContainer);
    
    // Initialize validation panel
    initValidationPanel((issue) => {
        // Navigate to entity when issue is clicked
        const node = getNode(issue.nodeId);
        if (node) {
            // Select node in tree (pass the node object, not the ID)
            handleNodeSelection(node);
        }
    });
    
    // Initialize search
    initSearch();
    
    // Initialize map
    initMap();
    
    // Initialize recent files
    initRecent();
    
    // Set initial button states
    updateButtonStates();
    
    // Setup toolbar buttons
    document.getElementById('btn-new')?.addEventListener('click', handleNew);
    document.getElementById('btn-open')?.addEventListener('click', handleOpen);
    document.getElementById('btn-save')?.addEventListener('click', handleSave);
    document.getElementById('btn-download')?.addEventListener('click', handleDownload);
    document.getElementById('btn-validate')?.addEventListener('click', handleValidate);
    document.getElementById('btn-map')?.addEventListener('click', handleMap);
    document.getElementById('btn-shortcuts')?.addEventListener('click', toggleShortcutsDialog);
    document.getElementById('map-close')?.addEventListener('click', closeMap);
    document.getElementById('map-floor-up')?.addEventListener('click', mapFloorUp);
    document.getElementById('map-floor-down')?.addEventListener('click', mapFloorDown);
    document.getElementById('map-zoom-in')?.addEventListener('click', zoomIn);
    document.getElementById('map-zoom-out')?.addEventListener('click', zoomOut);
    document.getElementById('map-zoom-fit')?.addEventListener('click', zoomFit);
    document.getElementById('map-save-png')?.addEventListener('click', exportAllFloorsPNG);
    
    // Setup tree toolbar buttons
    document.getElementById('btn-expand-all')?.addEventListener('click', expandAll);
    document.getElementById('btn-collapse-all')?.addEventListener('click', collapseAll);
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey;
        
        // Ctrl+S to save
        if (mod && e.key === 's' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        // Ctrl+Shift+S to save as (download)
        if (mod && e.key === 's' && e.shiftKey) {
            e.preventDefault();
            handleDownload();
        }
        // Ctrl+O to open
        if (mod && e.key === 'o') {
            e.preventDefault();
            handleOpen();
        }
        // Ctrl+N for new area (⌘+N unavailable on macOS - browser shortcut)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            handleNew();
        }
        // Ctrl+Z to undo
        if (mod && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
        }
        // Ctrl+Y or Ctrl+Shift+Z to redo
        if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            handleRedo();
        }
        // Ctrl+F to focus search
        if (mod && e.key === 'f') {
            e.preventDefault();
            focusSearch();
        }
        // F1 to toggle shortcuts help
        if (e.key === 'F1') {
            e.preventDefault();
            toggleShortcutsDialog();
        }
        // Ctrl+W to close current tab (⌘+W unavailable on macOS - browser shortcut)
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            closeCurrentTab();
        }
        // Ctrl+Tab / Ctrl+Shift+Tab to switch tabs (⌘+Tab unavailable on macOS - system shortcut)
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            switchTab(e.shiftKey ? -1 : 1);
        }
        // Ctrl+D to duplicate selected entity
        if (mod && e.key === 'd') {
            e.preventDefault();
            duplicateSelected();
        }
        // Delete/Backspace to delete selected entity (only when not in input)
        if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused()) {
            e.preventDefault();
            deleteSelected();
        }
        // Ctrl+=/+- to expand/collapse tree, or zoom in/out when map is open
        if (mod && (e.key === '=' || e.key === '+')) {
            e.preventDefault();
            if (isMapOpen()) zoomIn(); else expandAll();
        }
        if (mod && e.key === '-') {
            e.preventDefault();
            if (isMapOpen()) zoomOut(); else collapseAll();
        }
        // Ctrl+M to open map
        if (mod && e.key === 'm') {
            e.preventDefault();
            handleMap();
        }
        // Escape to close map (or other overlays)
        if (e.key === 'Escape') {
            if (isMapOpen()) {
                e.preventDefault();
                closeMap();
            }
        }
    });
    
    // Warn before closing with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (state.modified) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // Check for auto-save
    await checkAutoSave();
    
    // Show recent files
    const recent = await getRecent();
    if (recent.length > 0) {
        if (DEBUG) console.log('Recent files:', recent.map(r => r.filename));
    }
    
    if (DEBUG) console.log('EditIt ready.');
}

// Initialize when loaded
init();

// Export for console testing
// DEV: These are for debugging only. Remove or gate behind DEBUG flag before production.
window.handleOpen = handleOpen;
window.handleSave = handleSave;
window.handleDownload = handleDownload;
window.handleNew = handleNew;
window.handleUndo = handleUndo;
window.handleRedo = handleRedo;
window.undoManager = undoManager;
window.getRecent = getRecent;
window.clearRecent = clearRecent;
window.state = state;
window.parseFile = parseFile;
window.serializeFile = serializeFile;

if (DEBUG) console.log('EditIt loaded. Use handleOpen(), handleSave(), handleUndo(), handleRedo() in console.');
