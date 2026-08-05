/* tree.js - Tree view component for EditIt */

/**
 * Tree node structure
 * @typedef {Object} TreeNode
 * @property {string} id - Unique identifier (e.g., 'room-1000')
 * @property {string} label - Display text
 * @property {string} type - Entity type ('area', 'room', 'mob', 'object', etc.)
 * @property {string|null} parent - Parent node id
 * @property {string[]} children - Child node ids
 * @property {Object} data - Reference to area entity
 * @property {boolean} expanded - Expand/collapse state
 */

// Tree state
const nodes = new Map();
let selectedNodeId = null;
let treeContainer = null;
let contextMenu = null;
let onSelectionChange = null;
let onContextAction = null;

/**
 * Initialize tree view
 * @param {HTMLElement} container - Tree container element
 * @param {Object} options - Configuration options
 */
export function initTree(container, options = {}) {
    treeContainer = container;
    onSelectionChange = options.onSelectionChange || (() => {});
    onContextAction = options.onContextAction || (() => {});
    
    // Get context menu element
    contextMenu = document.getElementById('context-menu');
    
    // Setup event listeners
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Click on tree to select
    treeContainer.addEventListener('click', handleTreeClick);
    
    // Right-click for context menu
    treeContainer.addEventListener('contextmenu', handleContextMenu);
    
    // Hide context menu on click outside
    document.addEventListener('click', hideContextMenu);
    
    // Hide context menu on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
    
    // Context menu actions
    if (contextMenu) {
        contextMenu.addEventListener('click', handleContextAction);
    }
}

/**
 * Handle tree click
 * @param {Event} e 
 */
function handleTreeClick(e) {
    const target = e.target;
    
    // Check if click on toggle
    const toggle = target.closest('.tree-toggle');
    if (toggle) {
        const nodeEl = toggle.closest('.tree-node');
        const nodeId = nodeEl?.dataset.id;
        if (nodeId) {
            toggleNode(nodeId);
        }
        return;
    }
    
    // Check if click on node
    const nodeEl = target.closest('.tree-node');
    if (nodeEl) {
        const nodeId = nodeEl.dataset.id;
        if (nodeId) {
            selectNode(nodeId);
        }
    }
}

/**
 * Handle context menu
 * @param {MouseEvent} e 
 */
function handleContextMenu(e) {
    const nodeEl = e.target.closest('.tree-node');
    if (!nodeEl) return;
    
    e.preventDefault();
    
    const nodeId = nodeEl.dataset.id;
    const node = nodes.get(nodeId);
    
    // Don't show for root nodes
    if (!node || !node.parent) return;
    
    // Don't show for resets, shops, specials categories or their children
    if (['resets', 'shops', 'specials'].includes(nodeId) || 
        ['resets', 'shops', 'specials'].includes(node.parent)) return;
    
    // Show context menu
    showContextMenu(e.clientX, e.clientY, nodeId);
}

/**
 * Handle context menu action
 * @param {Event} e 
 */
function handleContextAction(e) {
    const item = e.target.closest('.context-item');
    if (!item) return;
    
    const action = item.dataset.action;
    const nodeId = contextMenu.dataset.nodeId;
    
    hideContextMenu();
    
    if (action && nodeId) {
        onContextAction(action, nodeId);
    }
}

/**
 * Render tree from area data
 * @param {Object} area - Parsed area data
 */
export function renderTree(area) {
    // Save expanded state before clearing
    const expandedState = new Map();
    nodes.forEach((node, id) => {
        expandedState.set(id, node.expanded);
    });
    
    // Clear existing nodes
    nodes.clear();
    treeContainer.innerHTML = '';
    
    if (!area) return;
    
    // Build tree structure
    const root = {
        id: 'root',
        label: `🗺️ ${area.general.areaName || 'Unnamed Area'}`,
        type: 'area',
        parent: null,
        children: [],
        data: area.general,
        expanded: expandedState.get('root') ?? true
    };
    nodes.set('root', root);
    
    // Add category nodes
    const categories = [
        { id: 'rooms', label: 'Rooms', type: 'category', icon: '🚪' },
        { id: 'mobs', label: 'Mobiles', type: 'category', icon: '👤' },
        { id: 'objects', label: 'Objects', type: 'category', icon: '📦' },
        { id: 'helps', label: 'Helps', type: 'category', icon: '❓' },
        { id: 'resets', label: 'Resets', type: 'category', icon: '🔄' },
        { id: 'shops', label: 'Shops', type: 'category', icon: '🏪' },
        { id: 'specials', label: 'Specials', type: 'category', icon: '✨' }
    ];
    
    categories.forEach(cat => {
        const node = {
            id: cat.id,
            label: `${cat.icon} ${cat.label}`,
            type: cat.type,
            parent: 'root',
            children: [],
            data: null,
            expanded: expandedState.get(cat.id) ?? true
        };
        nodes.set(cat.id, node);
        root.children.push(cat.id);
    });
    
    // Add rooms
    if (area.rooms) {
        area.rooms.forEach(room => {
            const id = `room-${room.VNum}`;
            const node = {
                id,
                label: room.name ? `#${room.VNum} - ${room.name}` : `#${room.VNum}`,
                type: 'room',
                parent: 'rooms',
                children: [],
                data: room,
                expanded: expandedState.get(id) ?? false
            };
            nodes.set(id, node);
            nodes.get('rooms').children.push(id);
        });
    }
    
    // Add mobs
    if (area.mobs) {
        area.mobs.forEach(mob => {
            const id = `mob-${mob.VNum}`;
            const node = {
                id,
                label: mob.shortDescr ? `#${mob.VNum} - ${mob.shortDescr}` : `#${mob.VNum}`,
                type: 'mob',
                parent: 'mobs',
                children: [],
                data: mob,
                expanded: expandedState.get(id) ?? false
            };
            nodes.set(id, node);
            nodes.get('mobs').children.push(id);
        });
    }
    
    // Add objects
    if (area.objs) {
        area.objs.forEach(obj => {
            const id = `obj-${obj.VNum}`;
            const node = {
                id,
                label: obj.shortDescr ? `#${obj.VNum} - ${obj.shortDescr}` : `#${obj.VNum}`,
                type: 'object',
                parent: 'objects',
                children: [],
                data: obj,
                expanded: expandedState.get(id) ?? false
            };
            nodes.set(id, node);
            nodes.get('objects').children.push(id);
        });
    }
    
    // Add helps
    if (area.helps) {
        area.helps.forEach((help, index) => {
            const id = `help-${index}`;
            const keywords = help.keywords.substring(0, 30);
            const node = {
                id,
                label: `[${help.level}] ${keywords}`,
                type: 'help',
                parent: 'helps',
                children: [],
                data: help,
                expanded: expandedState.get(id) ?? false
            };
            nodes.set(id, node);
            nodes.get('helps').children.push(id);
        });
    }
    
    // Add shops (mobs with isShopKeeper)
    if (area.mobs) {
        area.mobs.forEach(mob => {
            if (!mob.isShopKeeper) return;
            const id = `shop-${mob.VNum}`;
            const node = {
                id,
                label: `#${mob.VNum} - ${mob.shortDescr}`,
                type: 'shop',
                parent: 'shops',
                children: [],
                data: mob,
                expanded: false
            };
            nodes.set(id, node);
            nodes.get('shops').children.push(id);
        });
    }
    
    // Specials are now a panel, not individual nodes
    // Sort all category children by VNum
    const sortChildren = (nodeId) => {
        const node = nodes.get(nodeId);
        if (node && node.children.length > 0) {
            node.children.sort((a, b) => {
                const numA = parseInt(a.split('-').pop(), 10) || 0;
                const numB = parseInt(b.split('-').pop(), 10) || 0;
                return numA - numB;
            });
        }
    };
    
    ['rooms', 'mobs', 'objects', 'helps', 'shops'].forEach(sortChildren);
    
    // Render the tree
    renderNodes();
}

/**
 * Render all nodes
 */
function renderNodes() {
    treeContainer.innerHTML = '';
    const rootNode = nodes.get('root');
    if (rootNode) {
        const ul = document.createElement('ul');
        renderNode('root', ul);
        treeContainer.appendChild(ul);
    }
}

/**
 * Render a node and its children
 * @param {string} nodeId - Node id
 * @param {HTMLElement} container - Container element
 */
function renderNode(nodeId, container) {
    const node = nodes.get(nodeId);
    if (!node) return;
    
    const li = document.createElement('li');
    
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    nodeDiv.dataset.id = nodeId;
    
    // Toggle arrow (if has children)
    if (node.children.length > 0) {
        const toggle = document.createElement('span');
        toggle.className = `tree-toggle ${node.expanded ? 'expanded' : ''}`;
        toggle.textContent = '▶';
        nodeDiv.appendChild(toggle);
    } else {
        const spacer = document.createElement('span');
        spacer.className = 'tree-toggle';
        spacer.textContent = ' ';
        nodeDiv.appendChild(spacer);
    }
    
    // Label
    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = node.label;
    nodeDiv.appendChild(label);
    
    li.appendChild(nodeDiv);
    
    // Children
    if (node.children.length > 0) {
        const childUl = document.createElement('ul');
        childUl.className = `tree-children ${node.expanded ? 'expanded' : ''}`;
        
        node.children.forEach(childId => {
            renderNode(childId, childUl);
        });
        
        li.appendChild(childUl);
    }
    
    container.appendChild(li);
}

/**
 * Toggle node expand/collapse
 * @param {string} nodeId - Node id
 */
export function toggleNode(nodeId) {
    const node = nodes.get(nodeId);
    if (!node) return;
    
    node.expanded = !node.expanded;
    
    // Update DOM
    const nodeEl = treeContainer.querySelector(`[data-id="${nodeId}"]`);
    if (!nodeEl) return;
    
    const toggle = nodeEl.querySelector('.tree-toggle');
    if (toggle) {
        toggle.classList.toggle('expanded', node.expanded);
    }
    
    const childUl = nodeEl.parentElement?.querySelector('.tree-children');
    if (childUl) {
        childUl.classList.toggle('expanded', node.expanded);
    }
}

/**
 * Select a node
 * @param {string} nodeId - Node id
 */
export function selectNode(nodeId) {
    // Deselect previous
    if (selectedNodeId) {
        const prevEl = treeContainer.querySelector(`[data-id="${selectedNodeId}"]`);
        if (prevEl) {
            prevEl.classList.remove('selected');
        }
    }
    
    // Select new
    selectedNodeId = nodeId;
    const nodeEl = treeContainer.querySelector(`[data-id="${nodeId}"]`);
    if (nodeEl) {
        nodeEl.classList.add('selected');
    }
    
    // Notify listener
    const node = nodes.get(nodeId);
    onSelectionChange(node);
}

/**
 * Get selected node
 * @returns {TreeNode|null}
 */
export function getSelectedNode() {
    if (!selectedNodeId) return null;
    return nodes.get(selectedNodeId) || null;
}

/**
 * Clear selection
 */
export function clearSelection() {
    if (selectedNodeId) {
        const prevEl = treeContainer.querySelector(`[data-id="${selectedNodeId}"]`);
        if (prevEl) {
            prevEl.classList.remove('selected');
        }
    }
    selectedNodeId = null;
    onSelectionChange(null);
}

/**
 * Expand all nodes
 */
export function expandAll() {
    nodes.forEach((node, id) => {
        if (node.children.length > 0) {
            node.expanded = true;
        }
    });
    renderNodes();
}

/**
 * Collapse all nodes
 */
export function collapseAll() {
    nodes.forEach((node) => {
        node.expanded = false;
    });
    renderNodes();
}

/**
 * Show context menu
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} nodeId - Node id
 */
function showContextMenu(x, y, nodeId) {
    if (!contextMenu) return;
    
    contextMenu.dataset.nodeId = nodeId;
    
    // Get node to check type
    const node = nodes.get(nodeId);
    const isRootOrArea = !node || node.type === 'root' || node.type === 'area' || node.type === 'category' || !node.parent;
    
    // Enable/disable items based on node type
    contextMenu.querySelectorAll('.context-item').forEach(item => {
        const action = item.dataset.action;
        if (action === 'delete' || action === 'duplicate') {
            item.disabled = isRootOrArea;
            item.classList.toggle('disabled', isRootOrArea);
        }
    });
    
    // Position menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.remove('hidden');
    
    // Adjust if goes off screen
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = `${y - rect.height}px`;
    }
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.classList.add('hidden');
        delete contextMenu.dataset.nodeId;
    }
}

/**
 * Get node by id
 * @param {string} nodeId - Node id
 * @returns {TreeNode|null}
 */
export function getNode(nodeId) {
    return nodes.get(nodeId) || null;
}

/**
 * Add a node
 * @param {TreeNode} node - Node to add
 */
export function addNode(node) {
    nodes.set(node.id, node);
    
    // Add to parent's children
    if (node.parent) {
        const parent = nodes.get(node.parent);
        if (parent) {
            parent.children.push(node.id);
            
            // Sort children by VNum (extract number from id like 'room-27173')
            parent.children.sort((a, b) => {
                const numA = parseInt(a.split('-').pop(), 10) || 0;
                const numB = parseInt(b.split('-').pop(), 10) || 0;
                return numA - numB;
            });
        }
    }
    
    renderNodes();
}

/**
 * Remove a node
 * @param {string} nodeId - Node id
 */
export function removeNode(nodeId) {
    const node = nodes.get(nodeId);
    if (!node) return;
    
    // Remove from parent's children
    if (node.parent) {
        const parent = nodes.get(node.parent);
        if (parent) {
            parent.children = parent.children.filter(id => id !== nodeId);
        }
    }
    
    // Remove node and all descendants
    const removeRecursive = (id) => {
        const n = nodes.get(id);
        if (n) {
            n.children.forEach(removeRecursive);
            nodes.delete(id);
        }
    };
    removeRecursive(nodeId);
    
    // Clear selection if needed
    if (selectedNodeId === nodeId) {
        selectedNodeId = null;
    }
    
    renderNodes();
}

/**
 * Update a node's label in the DOM
 * @param {string} nodeId - Node id
 * @param {string} newLabel - New label text
 */
export function updateNodeLabel(nodeId, newLabel) {
    const node = nodes.get(nodeId);
    if (!node) return;
    
    // Update the data
    node.label = newLabel;
    
    // Update the DOM
    const nodeEl = treeContainer.querySelector(`[data-id="${nodeId}"]`);
    if (nodeEl) {
        const labelEl = nodeEl.querySelector('.tree-label');
        if (labelEl) {
            labelEl.textContent = newLabel;
        }
    }
}
