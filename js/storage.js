/* storage.js - File open/save, IndexedDB, auto-save */

const DEBUG = false;

/**
 * Browser capability detection
 */

/**
 * Check if File System Access API is available
 * @returns {boolean}
 */
export function hasFileSystemAccess() {
    return 'showOpenFilePicker' in window;
}

/**
 * Check if IndexedDB is available
 * @returns {boolean}
 */
export function hasIndexedDB() {
    return 'indexedDB' in window;
}

/**
 * Get all browser capabilities
 * @returns {{ fileSystemAccess: boolean, indexedDB: boolean }}
 */
export function getCapabilities() {
    const caps = {
        fileSystemAccess: hasFileSystemAccess(),
        indexedDB: hasIndexedDB()
    };
    
    if (DEBUG) console.log('Browser capabilities:', caps);
    return caps;
}

/**
 * Check if browser has minimum required support
 * @returns {{ supported: boolean, issues: string[] }}
 */
export function checkBrowserSupport() {
    const issues = [];
    
    if (!hasIndexedDB()) {
        issues.push('IndexedDB not supported - auto-save and recent files unavailable');
    }
    
    if (!hasFileSystemAccess()) {
        issues.push('File System Access API not supported - will use download/upload instead');
    }
    
    // Check for basic ES6 support
    if (typeof Promise === 'undefined') {
        issues.push('Promises not supported - application cannot run');
    }
    
    if (typeof fetch === 'undefined') {
        issues.push('Fetch API not supported - some features may not work');
    }
    
    return {
        supported: issues.length === 0 || (issues.length === 1 && issues[0].includes('File System Access')),
        issues: issues
    };
}

/**
 * IndexedDB wrapper
 */

const DB_NAME = 'editit-db';
const DB_VERSION = 1;

// Database instance (module-level)
let dbInstance = null;

/**
 * Initialize IndexedDB database
 * Creates object stores on first run
 * @returns {Promise<IDBDatabase>}
 */
export function initDB() {
    // Return existing instance if available
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }
    
    return new Promise((resolve, reject) => {
        if (!hasIndexedDB()) {
            reject(new Error('IndexedDB not supported'));
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create 'areas' store - key is filename
            if (!db.objectStoreNames.contains('areas')) {
                db.createObjectStore('areas', { keyPath: 'filename' });
            }
            
            // Create 'recent' store - auto-increment key
            if (!db.objectStoreNames.contains('recent')) {
                const store = db.createObjectStore('recent', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('filename', 'filename', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
            
            if (DEBUG) console.log('IndexedDB: created object stores');
        };
        
        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            
            // Handle connection errors
            dbInstance.onerror = (error) => {
                console.error('IndexedDB error:', error);
            };
            
            // Handle database being deleted/upgrade needed
            dbInstance.onversionchange = () => {
                dbInstance.close();
                dbInstance = null;
            };
            
            if (DEBUG) console.log('IndexedDB: connected to', DB_NAME);
            resolve(dbInstance);
        };
        
        request.onerror = (event) => {
            console.error('IndexedDB open failed:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Get database instance (initializes if needed)
 * @returns {Promise<IDBDatabase>}
 */
async function getDB() {
    if (!dbInstance) {
        await initDB();
    }
    return dbInstance;
}

/**
 * Write to an object store
 * @param {string} storeName - 'areas' or 'recent'
 * @param {*} key - Primary key
 * @param {*} value - Value to store
 * @returns {Promise<void>}
 */
export async function dbPut(storeName, key, value) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        const data = typeof key === 'object' ? key : { ...value, [store.keyPath || 'id']: key };
        const request = store.put(data);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            const error = event.target.error;
            console.error(`dbPut failed for ${storeName}:`, error);
            
            // Quota exceeded
            if (error.name === 'QuotaExceededError') {
                reject(new Error('Storage quota exceeded. Please clear some data.'));
            } else {
                reject(error);
            }
        };
    });
}

/**
 * Read from an object store
 * @param {string} storeName - 'areas' or 'recent'
 * @param {*} key - Primary key
 * @returns {Promise<*>}
 */
export async function dbGet(storeName, key) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
            console.error(`dbGet failed for ${storeName}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Read all entries from an object store
 * @param {string} storeName - 'areas' or 'recent'
 * @returns {Promise<Array>}
 */
export async function dbGetAll(storeName) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
            console.error(`dbGetAll failed for ${storeName}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Delete from an object store
 * @param {string} storeName - 'areas' or 'recent'
 * @param {*} key - Primary key
 * @returns {Promise<void>}
 */
export async function dbDelete(storeName, key) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error(`dbDelete failed for ${storeName}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Clear all entries from an object store
 * @param {string} storeName - 'areas' or 'recent'
 * @returns {Promise<void>}
 */
export async function dbClear(storeName) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error(`dbClear failed for ${storeName}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * File open — Modern path (File System Access API)
 */

/**
 * Open a .are file using File System Access API
 * Returns file text and handle for later saving
 * @returns {Promise<{text: string, handle: FileSystemFileHandle, filename: string}>}
 */
export async function openFileModern() {
    if (!hasFileSystemAccess()) {
        throw new Error('File System Access API not supported');
    }
    
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [
                {
                    description: 'Area Files',
                    accept: {
                        'text/plain': ['.are']
                    }
                }
            ],
            multiple: false
        });
        
        // Get file contents
        const file = await handle.getFile();
        const text = await file.text();
        const filename = file.name;
        
        // Validate file extension
        if (!filename.toLowerCase().endsWith('.are')) {
            throw new Error(`Invalid file type: "${filename}". Please select a .are file.`);
        }
        
        if (DEBUG) console.log(`Opened: ${filename} (${text.length} bytes)`);
        
        return { text, handle, filename };
        
    } catch (error) {
        // User cancelled the picker
        if (error.name === 'AbortError') {
            if (DEBUG) console.log('File open cancelled by user');
            return null;
        }
        
        // Permission error
        if (error.name === 'NotAllowedError') {
            console.error('Permission denied:', error);
            throw new Error('Permission denied. Please grant read access.');
        }
        
        // Other errors
        console.error('File open failed:', error);
        throw error;
    }
}

/**
 * File open — Fallback path (Input Element)
 * For browsers without File System Access API (Firefox, Safari)
 */

// Hidden input element (created on first use)
let fileInput = null;

/**
 * Create hidden file input element
 * @returns {HTMLInputElement}
 */
function getFileInput() {
    if (fileInput) {
        return fileInput;
    }
    
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.are';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    return fileInput;
}

/**
 * Open a .are file using hidden input element
 * Returns file text (no handle for saving)
 * @returns {Promise<{text: string, handle: null, filename: string} | null>}
 */
export function openFileFallback() {
    return new Promise((resolve, reject) => {
        const input = getFileInput();
        
        // Reset input so same file can be selected again
        input.value = '';
        
        // Set up change handler
        const onChange = async () => {
            // Remove handler after first use
            input.removeEventListener('change', onChange);
            
            const file = input.files[0];
            if (!file) {
                // User cancelled
                resolve(null);
                return;
            }
            
            const filename = file.name;
            
            // Validate file extension
            if (!filename.toLowerCase().endsWith('.are')) {
                reject(new Error(`Invalid file type: "${filename}". Please select a .are file.`));
                return;
            }
            
            try {
                const text = await file.text();
                if (DEBUG) console.log(`Opened (fallback): ${filename} (${text.length} bytes)`);
                resolve({ text, handle: null, filename });
            } catch (error) {
                console.error('File read failed:', error);
                reject(new Error(`Failed to read file: ${error.message}`));
            }
        };
        
        input.addEventListener('change', onChange);
        
        // Trigger file picker
        input.click();
    });
}

/**
 * Main file open function
 * Detects browser capability and calls appropriate path
 * @returns {Promise<{text: string, handle: FileSystemFileHandle | null, filename: string} | null>}
 */
export async function openFile() {
    let result = null;
    
    if (hasFileSystemAccess()) {
        result = await openFileModern();
    } else {
        result = await openFileFallback();
    }
    
    // Clear auto-save after successful open
    if (result) {
        await clearAutoSave();
    }
    
    return result;
}

/**
 * File save — Modern path (File System Access API)
 */

/**
 * Save file using File System Access API
 * Writes to the original file location
 * @param {FileSystemFileHandle} handle - File handle from openFileModern
 * @param {string} text - File contents to write
 * @returns {Promise<boolean>} - true on success
 */
export async function saveFileModern(handle, text) {
    if (!handle) {
        throw new Error('No file handle provided');
    }
    
    if (DEBUG) console.log('saveFileModern: Checking permissions...');
    // Check if handle is still valid
    const permissions = await handle.queryPermission({ mode: 'readwrite' });
    if (DEBUG) console.log('saveFileModern: Current permissions:', permissions);
    if (permissions !== 'granted') {
        // Try to request permission
        if (DEBUG) console.log('saveFileModern: Requesting permission...');
        const newPermission = await handle.requestPermission({ mode: 'readwrite' });
        if (DEBUG) console.log('saveFileModern: New permissions:', newPermission);
        if (newPermission !== 'granted') {
            throw new Error('Permission denied. Please grant write access.');
        }
    }
    
    try {
        if (DEBUG) console.log('saveFileModern: Creating writable stream...');
        const writable = await handle.createWritable();
        if (DEBUG) console.log('saveFileModern: Writing', text.length, 'bytes...');
        await writable.write(text);
        if (DEBUG) console.log('saveFileModern: Closing stream...');
        await writable.close();
        
        if (DEBUG) console.log(`Saved: ${text.length} bytes`);
        return true;
        
    } catch (error) {
        console.error('saveFileModern: Error:', error);
        // User cancelled or permission error
        if (error.name === 'AbortError') {
            if (DEBUG) console.log('Save cancelled by user');
            return false;
        }
        
        if (error.name === 'NotAllowedError') {
            throw new Error('Permission denied. Please grant write access.');
        }
        
        console.error('Save failed:', error);
        throw error;
    }
}

/**
 * File save — Fallback path (Download)
 * For browsers without File System Access API (Firefox, Safari)
 */

/**
 * Save file by downloading it
 * @param {string} filename - Filename to download as
 * @param {string} text - File contents to write
 * @returns {boolean} - true on success
 */
export function saveFileFallback(filename, text) {
    try {
        // Create blob from text
        const blob = new Blob([text], { type: 'text/plain' });
        
        // Create object URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'area.are';
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (DEBUG) console.log(`Downloaded: ${filename} (${text.length} bytes)`);
        return true;
        
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error(`Failed to download file: ${error.message}`);
    }
}

/**
 * Main file save function
 * Uses modern path if handle available, otherwise fallback
 * @param {FileSystemFileHandle | null} handle - File handle from open (null for fallback)
 * @param {string} filename - Filename for fallback download
 * @param {string} text - File contents to write
 * @returns {Promise<boolean>} - true on success
 */
export async function saveFile(handle, filename, text) {
    // Use modern path if we have a handle
    if (handle && hasFileSystemAccess()) {
        return saveFileModern(handle, text);
    }
    
    // Fallback to download
    return saveFileFallback(filename, text);
}

/**
 * Auto-Save Logic
 */

const AUTOSAVE_KEY = 'current';
const AUTOSAVE_HISTORY_KEY = 'history';
const MAX_AUTOSAVE_SNAPSHOTS = 2;
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

// Auto-save state
let autoSaveIntervalId = null;
let autoSaveFilename = null;
let autoSaveGetTextFn = null;

/**
 * Save current file to IndexedDB
 * @param {string} filename - Current filename
 * @param {string} text - Current file contents
 * @returns {Promise<void>}
 */
export async function autoSave(filename, text) {
    if (!hasIndexedDB()) {
        return;
    }
    
    try {
        // Save current state
        await dbPut('areas', AUTOSAVE_KEY, {
            filename: AUTOSAVE_KEY,
            originalFilename: filename,
            text: text,
            lastModified: Date.now()
        });
        
        // Keep history of previous snapshots
        const history = await dbGet('areas', AUTOSAVE_HISTORY_KEY) || { snapshots: [] };
        const now = Date.now();
        
        // Only add to history if enough time has passed (5 minutes)
        const lastSnapshot = history.snapshots[0];
        if (!lastSnapshot || (now - lastSnapshot.lastModified > 5 * 60 * 1000)) {
            history.snapshots.unshift({
                originalFilename: filename,
                text: text,
                lastModified: now
            });
            
            // Keep only last N snapshots
            if (history.snapshots.length > MAX_AUTOSAVE_SNAPSHOTS) {
                history.snapshots = history.snapshots.slice(0, MAX_AUTOSAVE_SNAPSHOTS);
            }
            
            await dbPut('areas', AUTOSAVE_HISTORY_KEY, history);
        }
        
        if (DEBUG) console.log('Auto-saved:', filename);
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

/**
 * Get auto-saved file from IndexedDB
 * @returns {Promise<{filename: string, text: string, lastModified: number} | null>}
 */
export async function getAutoSave() {
    if (!hasIndexedDB()) {
        return null;
    }
    
    try {
        const result = await dbGet('areas', AUTOSAVE_KEY);
        if (result) {
            if (DEBUG) console.log('Found auto-save:', result.originalFilename);
        }
        return result;
    } catch (error) {
        console.error('Get auto-save failed:', error);
        return null;
    }
}

/**
 * Get auto-save history snapshots
 * @returns {Promise<Array>}
 */
export async function getAutoSaveHistory() {
    if (!hasIndexedDB()) {
        return [];
    }
    
    try {
        const history = await dbGet('areas', AUTOSAVE_HISTORY_KEY);
        return history?.snapshots || [];
    } catch (error) {
        console.error('Get auto-save history failed:', error);
        return [];
    }
}

/**
 * Clear auto-saved file from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearAutoSave() {
    if (!hasIndexedDB()) {
        return;
    }
    
    try {
        await dbDelete('areas', AUTOSAVE_KEY);
        await dbDelete('areas', AUTOSAVE_HISTORY_KEY);
        await dbDelete('areas', 'corrupt');
        if (DEBUG) console.log('Auto-save cleared');
    } catch (error) {
        console.error('Clear auto-save failed:', error);
    }
}

export async function getCorruptAutoSave() {
    if (!hasIndexedDB()) return null;
    try {
        return await dbGet('areas', 'corrupt');
    } catch (error) {
        return null;
    }
}

/**
 * Start auto-saving at regular intervals
 * @param {string} filename - Filename to auto-save
 * @param {Function} getTextFn - Function that returns current text
 */
export function startAutoSave(filename, getTextFn) {
    // Stop any existing auto-save
    stopAutoSave();
    
    autoSaveFilename = filename;
    autoSaveGetTextFn = getTextFn;
    
    // Save immediately on start
    const text = getTextFn();
    if (text) {
        autoSave(filename, text);
    }
    
    // Set up interval
    autoSaveIntervalId = setInterval(() => {
        if (autoSaveGetTextFn && autoSaveFilename) {
            const text = autoSaveGetTextFn();
            if (text) {
                autoSave(autoSaveFilename, text);
            }
        }
    }, AUTOSAVE_INTERVAL);
    
    if (DEBUG) console.log('Auto-save started:', filename);
}

/**
 * Stop auto-saving
 */
export function stopAutoSave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
    }
    
    autoSaveFilename = null;
    autoSaveGetTextFn = null;
    
    if (DEBUG) console.log('Auto-save stopped');
}

/**
 * Recently Opened List
 */

const MAX_RECENT = 10;

/**
 * Add file to recently opened list
 * Moves to top if already exists
 * @param {string} filename - Filename to add
 * @returns {Promise<void>}
 */
export async function addRecent(filename) {
    if (!hasIndexedDB() || !filename) {
        return;
    }
    
    try {
        // Check if already exists
        const all = await dbGetAll('recent');
        const existing = all.find(r => r.filename === filename);
        
        // Remove if exists (will re-add at top)
        if (existing) {
            await dbDelete('recent', existing.id);
        }
        
        // Add new entry
        const db = await getDB();
        const tx = db.transaction('recent', 'readwrite');
        const store = tx.objectStore('recent');
        
        await new Promise((resolve, reject) => {
            const request = store.add({
                filename: filename,
                timestamp: Date.now()
            });
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
        
        // Trim to max entries
        const updated = await dbGetAll('recent');
        if (updated.length > MAX_RECENT) {
            // Sort by timestamp ascending (oldest first)
            updated.sort((a, b) => a.timestamp - b.timestamp);
            
            // Delete oldest entries
            const toDelete = updated.slice(0, updated.length - MAX_RECENT);
            for (const entry of toDelete) {
                await dbDelete('recent', entry.id);
            }
        }
        
        if (DEBUG) console.log('Added to recent:', filename);
        
    } catch (error) {
        console.error('Add recent failed:', error);
    }
}

/**
 * Get recently opened list
 * @returns {Promise<Array<{id: number, filename: string, timestamp: number}>>}
 */
export async function getRecent() {
    if (!hasIndexedDB()) {
        return [];
    }
    
    try {
        const all = await dbGetAll('recent');
        // Sort by timestamp descending (newest first)
        all.sort((a, b) => b.timestamp - a.timestamp);
        return all;
    } catch (error) {
        console.error('Get recent failed:', error);
        return [];
    }
}

/**
 * Clear recently opened list
 * @returns {Promise<void>}
 */
export async function clearRecent() {
    if (!hasIndexedDB()) {
        return;
    }
    
    try {
        await dbClear('recent');
        if (DEBUG) console.log('Recent list cleared');
    } catch (error) {
        console.error('Clear recent failed:', error);
    }
}

/**
 * Remove specific entry from recently opened list
 * @param {string} filename - Filename to remove
 * @returns {Promise<void>}
 */
export async function removeRecent(filename) {
    if (!hasIndexedDB() || !filename) {
        return;
    }
    
    try {
        const all = await dbGetAll('recent');
        const entry = all.find(r => r.filename === filename);
        
        if (entry) {
            await dbDelete('recent', entry.id);
            if (DEBUG) console.log('Removed from recent:', filename);
        }
    } catch (error) {
        console.error('Remove recent failed:', error);
    }
}
