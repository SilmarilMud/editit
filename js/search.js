/* search.js - Search engine for EditIt */

import { escapeHtml } from './utils.js';

/**
 * Search result
 * @typedef {Object} SearchResult
 * @property {Object} entity - The matched entity
 * @property {string} entityType - 'mob', 'object', 'room', 'help', 'area'
 * @property {string} field - Field name that matched
 * @property {string} match - The matched text (for highlighting)
 * @property {number} vnum - Entity VNum (or index for helps)
 * @property {string} nodeId - Tree node id for navigation
 */

/**
 * Search options
 * @typedef {Object} SearchOptions
 * @property {boolean} caseSensitive - Case-sensitive search (default: false)
 * @property {boolean} matchWhole - Match whole words only (default: false)
 * @property {string[]} searchIn - Entity types to search (default: all)
 * @property {number} maxResults - Maximum results to return (default: 100)
 */

const DEFAULT_OPTIONS = {
    caseSensitive: false,
    matchWhole: false,
    searchIn: ['area', 'mob', 'object', 'room', 'help'],
    maxResults: 100
};

/**
 * Fields to search for each entity type
 */
const SEARCH_FIELDS = {
    area: ['areaName', 'author', 'resetMsg', 'areaMusic', 'planeName'],
    mob: ['VNum', 'keywords', 'shortDescr', 'longDescr', 'descr', 'special'],
    object: ['VNum', 'keywords', 'shortDescr', 'longDescr', 'action'],
    room: ['VNum', 'name', 'descr'],
    help: ['keywords', 'text']
};

/**
 * Search the area for matching text
 * @param {Object} area - The area data
 * @param {string} query - Search query
 * @param {SearchOptions} options - Search options
 * @returns {SearchResult[]}
 */
export function searchArea(area, query, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    if (!query || query.trim() === '') return [];
    
    const results = [];
    const q = opts.caseSensitive ? query : query.toLowerCase();
    
    // Search area general
    if (opts.searchIn.includes('area') && area.general) {
        searchEntity(area.general, 'area', null, q, opts, results);
    }
    
    // Search mobiles
    if (opts.searchIn.includes('mob') && area.mobs) {
        for (const mob of area.mobs) {
            searchEntity(mob, 'mob', mob.VNum, q, opts, results);
            if (results.length >= opts.maxResults) break;
        }
    }
    
    // Search objects
    if (opts.searchIn.includes('object') && area.objs) {
        for (const obj of area.objs) {
            searchEntity(obj, 'object', obj.VNum, q, opts, results);
            if (results.length >= opts.maxResults) break;
        }
    }
    
    // Search rooms
    if (opts.searchIn.includes('room') && area.rooms) {
        for (const room of area.rooms) {
            searchEntity(room, 'room', room.VNum, q, opts, results);
            if (results.length >= opts.maxResults) break;
        }
    }
    
    // Search helps
    if (opts.searchIn.includes('help') && area.helps) {
        for (let i = 0; i < area.helps.length; i++) {
            const help = area.helps[i];
            searchEntity(help, 'help', i, q, opts, results);
            if (results.length >= opts.maxResults) break;
        }
    }
    
    return results;
}

/**
 * Search a single entity for matching fields
 * @param {Object} entity - Entity to search
 * @param {string} entityType - Type of entity
 * @param {number|null} vnum - Entity VNull (null for area)
 * @param {string} query - Lowercase query (if case-insensitive)
 * @param {SearchOptions} options
 * @param {SearchResult[]} results - Results array to push to
 */
function searchEntity(entity, entityType, vnum, query, options, results) {
    const fields = SEARCH_FIELDS[entityType] || [];
    
    for (const field of fields) {
        const value = entity[field];
        if (value === undefined || value === null) continue;
        
        // Handle array fields (e.g., extraDescr)
        if (Array.isArray(value)) {
            for (const item of value) {
                if (item.keywords && matchesQuery(item.keywords, query, options)) {
                    addResult(results, entity, entityType, vnum, 'keywords', item.keywords, options);
                }
                if (item.descr && matchesQuery(item.descr, query, options)) {
                    addResult(results, entity, entityType, vnum, 'descr', item.descr, options);
                }
            }
            continue;
        }
        
        // Convert number fields to string for searching
        const strValue = typeof value === 'number' ? String(value) : String(value);
        if (matchesQuery(strValue, query, options)) {
            addResult(results, entity, entityType, vnum, field, strValue, options);
        }
    }
}

/**
 * Check if a string matches the query
 * @param {string} text - Text to search in
 * @param {string} query - Query to match (already lowercased if case-insensitive)
 * @param {SearchOptions} options
 * @returns {boolean}
 */
function matchesQuery(text, query, options) {
    const t = options.caseSensitive ? text : text.toLowerCase();
    
    if (options.matchWhole) {
        // Match whole word boundaries
        const regex = new RegExp(`\\b${escapeRegex(query)}\\b`, options.caseSensitive ? 'g' : 'gi');
        return regex.test(t);
    }
    
    return t.includes(query);
}

/**
 * Escape special regex characters
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Add a result to the results array
 * @param {SearchResult[]} results
 * @param {Object} entity
 * @param {string} entityType
 * @param {number|null} vnum
 * @param {string} field
 * @param {string} matchText
 * @param {SearchOptions} options
 */
function addResult(results, entity, entityType, vnum, field, matchText, options) {
    // Don't exceed max results
    if (results.length >= options.maxResults) return;
    
    // Create node id
    let nodeId;
    if (entityType === 'area') {
        nodeId = 'root';
    } else if (entityType === 'help') {
        nodeId = `help-${vnum}`;
    } else if (entityType === 'object') {
        nodeId = `obj-${vnum}`;  // Tree uses 'obj' prefix
    } else {
        nodeId = `${entityType}-${vnum}`;
    }
    
    // Check for duplicate (same entity + field)
    const existing = results.find(r => r.nodeId === nodeId && r.field === field);
    if (existing) return;
    
    results.push({
        entity,
        entityType,
        field,
        match: matchText,
        vnum,
        nodeId
    });
}

/**
 * Get a context snippet around the match
 * @param {string} text - Full text
 * @param {string} query - Query to find
 * @param {SearchOptions} options
 * @param {number} contextLen - Characters of context around match
 * @returns {string}
 */
export function getContextSnippet(text, query, options, contextLen = 40) {
    if (!text) return '';
    
    const t = options.caseSensitive ? text : text.toLowerCase();
    const q = options.caseSensitive ? query : query.toLowerCase();
    const idx = t.indexOf(q);
    
    if (idx === -1) return text.substring(0, contextLen * 2) + '...';
    
    const start = Math.max(0, idx - contextLen);
    const end = Math.min(text.length, idx + q.length + contextLen);
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
}

/**
 * Highlight matching text in a string
 * @param {string} text - Text to highlight
 * @param {string} query - Query to highlight
 * @param {SearchOptions} options
 * @returns {string} HTML with highlighted matches
 */
export function highlightMatch(text, query, options) {
    if (!text || !query) return escapeHtml(text || '');
    
    const escaped = escapeRegex(query);
    const flags = options.caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${escaped})`, flags);
    
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}



/**
 * Entity type display names
 */
export const ENTITY_TYPE_NAMES = {
    area: 'Area',
    mob: 'Mobile',
    object: 'Object',
    room: 'Room',
    help: 'Help'
};

/**
 * Entity type icons
 */
export const ENTITY_TYPE_ICONS = {
    area: '🗺️',
    mob: '👤',
    object: '📦',
    room: '🚪',
    help: '❓'
};
