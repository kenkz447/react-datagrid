import React, { useCallback, useEffect, useRef } from 'react';
import { createKeybindingsHandler, type KeyBindingMap } from 'tinykeys';
import { isPrintableUnicode } from '../../utils/copyPasting';
import { RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';
import { getAllTabbableElements } from '../../utils/tab';

// Define keyboard action types
export type KeyboardAction =
    | 'goBottom'
    | 'goUp'
    | 'goLeft'
    | 'goRight'
    | 'jumpBottom'
    | 'jumpTop'
    | 'jumpLeft'
    | 'jumpRight'
    | 'selectRight'
    | 'selectLeft'
    | 'selectDown'
    | 'selectUp'
    | 'escape'
    | 'edit'
    | 'insertRow'
    | 'duplicateRow'
    | 'delete'
    | 'selectAll';

// Define keyboard shortcuts configuration type
export type KeyboardShortcutConfig = Partial<Record<KeyboardAction, string | string[]>>;

// Default keyboard shortcuts configuration
const defaultShortcuts: KeyboardShortcutConfig = {
    goBottom: 'ArrowDown',
    goUp: 'ArrowUp',
    goLeft: ['ArrowLeft', 'Shift+Tab'],
    goRight: ['ArrowRight', 'Tab'],
    jumpBottom: '$mod+ArrowDown',
    jumpTop: '$mod+ArrowUp',
    jumpLeft: '$mod+ArrowLeft',
    jumpRight: '$mod+ArrowRight',

    selectRight: 'Shift+ArrowRight',
    selectLeft: 'Shift+ArrowLeft',
    selectDown: 'Shift+ArrowDown',
    selectUp: 'Shift+ArrowUp',

    escape: 'Escape',
    edit: ['Enter', 'F2'],
    insertRow: 'Shift+Enter',
    duplicateRow: '$mod+d',
    delete: ['Backspace', 'Delete'],
    selectAll: '$mod+a'
};

export const useKeydownHandler = <TRow extends RowData>(
    datagrid: UseDatagridReturn<TRow>,
    customShortcuts?: KeyboardShortcutConfig
) => {
    const {
        editing,
        activeCell,
        columns,
        data,
        hasStickyRightColumn,
        selection,
        beforeTabIndexRef,
        afterTabIndexRef,
        setLastEditingCell,
        insertRowAfter,
        isCellDisabled,
        setActiveCell,
        setEditing,
        stopEditing,
        deleteSelection,
        duplicateRows,
        scrollTo
    } = datagrid;

    const refsValue = {
        editing,
        selection,
        activeCell,
        columns,
        data,
        hasStickyRightColumn,
    };
    const refs = useRef(refsValue);
    refs.current = refsValue;

    // Merge default and custom shortcuts
    const shortcuts = React.useMemo(() => ({
        ...defaultShortcuts,
        ...customShortcuts
    }), [customShortcuts]);

    const handlerRef = useRef<(() => void) | null>(null);

    // Helper functions
    const focusOutside = React.useCallback((direction: 'top' | 'bottom') => {
        if (direction === 'top') {
            const allElements = getAllTabbableElements();
            const index = allElements.indexOf(beforeTabIndexRef.current);
            allElements[(index - 1 + allElements.length) % allElements.length].focus();
        } else {
            const allElements = getAllTabbableElements();
            const index = allElements.indexOf(afterTabIndexRef.current);
            allElements[(index + 1) % allElements.length].focus();
        }
    }, [beforeTabIndexRef, afterTabIndexRef]);

    // Define handler for preprocessing events
    const preProcessEvent = useCallback((event: KeyboardEvent): boolean => {
        if (!refs.current.activeCell || event.isComposing) return false;

        const disableKeys = refs.current.columns[refs.current.activeCell.col + 1]?.disableKeys;
        if (disableKeys) return false;

        if (refs.current.editing && event.key.startsWith('Arrow')) {
            if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                return false;
            }
        }

        return true;
    }, []);

    // Define handler functions for each keyboard action
    const handleTabNext = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        const isLastCell = refs.current.activeCell.col === refs.current.columns.length - (refs.current.hasStickyRightColumn ? 3 : 2);
        if (isLastCell) {
            const isLastRow = refs.current.activeCell.row === refs.current.data.length - 1;
            if (isLastRow) {
                refs.current.selection.existFocus();
                focusOutside('bottom');
                return;
            }
            refs.current.selection.goNextRow();
            return;
        }

        refs.current.selection.goRight();
    }, [preProcessEvent, focusOutside]);

    const handleTabPrevious = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        const isFirstCell = refs.current.activeCell.col === 0;
        if (isFirstCell) {
            const isFirstRow = refs.current.activeCell.row === 0;
            if (isFirstRow) {
                refs.current.selection.existFocus();
                focusOutside('top');
                return;
            }
            refs.current.selection.goPrevRow();
            return;
        }

        refs.current.selection.goLeft();
    }, [preProcessEvent, focusOutside]);

    const handleArrowDown = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        refs.current.selection.goDown();
    }, [preProcessEvent]);

    const handleArrowUp = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        setEditing(false);

        refs.current.selection.goUp();
    }, [preProcessEvent, setEditing]);

    const handleArrowLeft = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        refs.current.selection.goLeft();
    }, [preProcessEvent]);

    const handleArrowRight = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        setEditing(false);

        refs.current.selection.goRight();
    }, [preProcessEvent, setEditing]);

    const handleJumpBottom = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        refs.current.selection.jumpDown();
    }, [preProcessEvent]);

    const handleJumpTop = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        refs.current.selection.jumpUp();
    }, [preProcessEvent]);

    const handleJumpLeft = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        refs.current.selection.jumpLeft();
    }, [preProcessEvent]);

    const handleJumpRight = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        refs.current.selection.jumpRight();
    }, [preProcessEvent]);

    const handleSelectRight = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        refs.current.selection.selectRight();
        setEditing(false);
    }, [preProcessEvent, setEditing]);

    const handleSelectLeft = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        refs.current.selection.selectLeft();
        setEditing(false);
    }, [preProcessEvent, setEditing]);

    const handleSelectDown = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        refs.current.selection.selectDown();
        setEditing(false);
    }, [preProcessEvent, setEditing]);

    const handleSelectUp = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        refs.current.selection.selectUp();
        setEditing(false);
    }, [preProcessEvent, setEditing]);

    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        if (!refs.current.editing && !refs.current.selection) {
            setActiveCell(null);
        }

        refs.current.selection.setSelectionCell(null);
    }, [preProcessEvent, setActiveCell]);

    const handleEdit = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;

        event.preventDefault();
        refs.current.selection.setSelectionCell(null);

        if (refs.current) {
            stopEditing();
            return;
        }

        if (!isCellDisabled(refs.current.activeCell)) {
            setLastEditingCell(refs.current.activeCell);
            setEditing(true);
            scrollTo(refs.current.activeCell);
        }
    }, [preProcessEvent, isCellDisabled, setLastEditingCell, setEditing, stopEditing, scrollTo]);

    const handleInsertRow = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;

        insertRowAfter(refs.current.selection.range?.max.row ?? refs.current.activeCell.row);
    }, [preProcessEvent, insertRowAfter]);

    const handleDuplicateRow = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;

        event.preventDefault();
        duplicateRows(refs.current.selection.range?.min.row ?? refs.current.activeCell.row, refs.current.selection.range?.max.row);
    }, [preProcessEvent, duplicateRows]);

    const handleDelete = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        if (refs.current.editing) return;

        event.preventDefault();
        deleteSelection();
    }, [preProcessEvent, deleteSelection]);

    const handleSelectAll = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        if (refs.current.editing) return;

        event.preventDefault();
        refs.current.selection.selectAll();
    }, [preProcessEvent]);

    // Handle printable character input
    const handleKeydown = useCallback((event: KeyboardEvent) => {
        if (!refs.current.activeCell || refs.current) return;

        const isPureInput = (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) &&
            !event.ctrlKey && !event.metaKey && !event.altKey;
        const canInput = !isCellDisabled(refs.current.activeCell);

        if (isPureInput && canInput) {
            setLastEditingCell(refs.current.activeCell);
            setEditing(true);
            scrollTo(refs.current.activeCell);
        } else if (isPureInput && !canInput) {
            setLastEditingCell(refs.current.activeCell);
            refs.current.selection.existFocus();
            scrollTo(refs.current.activeCell);
        }
    }, [isCellDisabled, setLastEditingCell, setEditing, scrollTo]);

    useEffect(() => {
        // Define keybindings
        const keyBindings: KeyBindingMap = {};

        // Helper to add a keybinding for an action
        const addKeybinding = (action: KeyboardAction, handler: (event: KeyboardEvent) => void) => {
            const shortcutKeys = shortcuts[action];
            if (!shortcutKeys) return;

            const keys = Array.isArray(shortcutKeys) ? shortcutKeys : [shortcutKeys];
            keys.forEach(key => {
                keyBindings[key] = handler;
            });
        };

        // Map actions to handlers
        addKeybinding('goBottom', handleArrowDown);
        addKeybinding('goUp', handleArrowUp);
        addKeybinding('goLeft', handleArrowLeft);
        addKeybinding('goRight', handleArrowRight);
        addKeybinding('jumpBottom', handleJumpBottom);
        addKeybinding('jumpTop', handleJumpTop);
        addKeybinding('jumpLeft', handleJumpLeft);
        addKeybinding('jumpRight', handleJumpRight);
        addKeybinding('selectRight', handleSelectRight);
        addKeybinding('selectLeft', handleSelectLeft);
        addKeybinding('selectDown', handleSelectDown);
        addKeybinding('selectUp', handleSelectUp);
        addKeybinding('selectAll', handleSelectAll);

        addKeybinding('escape', handleEscape);

        addKeybinding('edit', handleEdit);
        addKeybinding('insertRow', handleInsertRow);
        addKeybinding('duplicateRow', handleDuplicateRow);
        addKeybinding('delete', handleDelete);

        // Create and bind handlers
        const keyHandler = createKeybindingsHandler(keyBindings);
        document.addEventListener('keydown', keyHandler);
        document.addEventListener('keydown', handleKeydown);

        handlerRef.current = () => {
            document.removeEventListener('keydown', keyHandler);
            document.removeEventListener('keydown', handleKeydown);
        };

        return () => {
            if (handlerRef.current) {
                handlerRef.current();
                handlerRef.current = null;
            }
        };
    }, [shortcuts, handleTabNext, handleTabPrevious, handleArrowDown, handleArrowUp, handleArrowLeft, handleArrowRight, handleJumpBottom, handleJumpTop, handleJumpLeft, handleJumpRight, handleEscape, handleEdit, handleInsertRow, handleDuplicateRow, handleDelete, handleSelectAll, handleKeydown, handleSelectRight, handleSelectLeft, handleSelectDown, handleSelectUp]);
};
