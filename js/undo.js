/* undo.js - Undo/Redo manager for EditIt */

/**
 * Action types
 */
const ActionType = {
    FIELD_EDIT: 'field-edit',      // Single field changed
    ENTITY_ADD: 'entity-add',      // Entity added to array
    ENTITY_DELETE: 'entity-delete', // Entity removed from array
    RESET_EDIT: 'reset-edit',      // Reset command changed
    BULK: 'bulk'                   // Multiple actions grouped (e.g., duplicate)
};

/**
 * UndoManager - tracks actions for undo/redo
 */
class UndoManager {
    constructor(maxSize = 100) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxSize = maxSize;
        this.enabled = true;
    }

    /**
     * Push an action onto the undo stack
     * @param {Object} action
     */
    push(action) {
        if (!this.enabled) return;
        
        this.undoStack.push(action);
        this.redoStack = []; // Clear redo on new action
        
        // Limit stack size
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
    }

    /**
     * Undo the last action
     * @returns {Object|null} The undone action, or null
     */
    undo() {
        if (this.undoStack.length === 0) return null;
        const action = this.undoStack.pop();
        this.redoStack.push(action);
        return action;
    }

    /**
     * Redo the last undone action
     * @returns {Object|null} The redone action, or null
     */
    redo() {
        if (this.redoStack.length === 0) return null;
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        return action;
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Get number of undoable actions
     * @returns {number}
     */
    undoCount() {
        return this.undoStack.length;
    }

    /**
     * Get number of redoable actions
     * @returns {number}
     */
    redoCount() {
        return this.redoStack.length;
    }

    /**
     * Clear all undo/redo history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Get a description of the last action (for UI display)
     * @returns {string|null}
     */
    getLastActionDescription() {
        const action = this.undoStack[this.undoStack.length - 1];
        if (!action) return null;
        return describeAction(action);
    }
}

/**
 * Describe an action in human-readable form
 * @param {Object} action
 * @returns {string}
 */
function describeAction(action) {
    switch (action.type) {
        case ActionType.FIELD_EDIT:
            return `Changed ${action.field} of ${action.entityType} #${action.entityVNum}`;
        case ActionType.ENTITY_ADD:
            return `Added ${action.entityType} #${action.entityVNum}`;
        case ActionType.ENTITY_DELETE:
            return `Deleted ${action.entityType} #${action.entityVNum}`;
        case ActionType.BULK:
            return action.description || `Bulk action (${action.actions.length} changes)`;
        default:
            return 'Unknown action';
    }
}

// Create singleton instance
const undoManager = new UndoManager();

// Export
export { undoManager, ActionType, describeAction };
