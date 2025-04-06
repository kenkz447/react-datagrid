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
        selection,
        selectionCell,
        activeCell,
        columns,
        data,
        hasStickyRightColumn,
        navigation,
        beforeTabIndexRef,
        afterTabIndexRef,
        setLastEditingCell,
        insertRowAfter,
        isCellDisabled,
        setActiveCell,
        setEditing,
        setSelectionCell,
        stopEditing,
        deleteSelection,
        duplicateRows,
        scrollTo
    } = datagrid;

    const refs = {
        editing,
        selection,
        selectionCell,
        activeCell,
        columns,
        data,
        hasStickyRightColumn,
    };
    const datagridRefs = useRef(refs);
    datagridRefs.current = refs;

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

    const selectAll = useCallback(() => {
        setEditing(false);
        setActiveCell({
            col: 0,
            row: 0,
            doNotScrollY: true,
            doNotScrollX: true,
        });
        setSelectionCell({
            col: datagridRefs.current.columns.length - (datagridRefs.current.hasStickyRightColumn ? 3 : 2),
            row: datagridRefs.current.data.length - 1,
            doNotScrollY: true,
            doNotScrollX: true,
        });
    }, [setEditing, setActiveCell, setSelectionCell]);

    // Define handler for preprocessing events
    const preProcessEvent = useCallback((event: KeyboardEvent): boolean => {
        if (!datagridRefs.current.activeCell || event.isComposing) return false;

        const disableKeys = datagridRefs.current.columns[datagridRefs.current.activeCell.col + 1]?.disableKeys;
        if (disableKeys) return false;

        if (datagridRefs.current.editing && event.key.startsWith('Arrow')) {
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

        const isLastCell = datagridRefs.current.activeCell.col === datagridRefs.current.columns.length - (datagridRefs.current.hasStickyRightColumn ? 3 : 2);
        if (isLastCell) {
            const isLastRow = datagridRefs.current.activeCell.row === datagridRefs.current.data.length - 1;
            if (isLastRow) {
                navigation.existFocus();
                focusOutside('bottom');
                return;
            }
            navigation.goNextRow();
            return;
        }

        navigation.goRight();
    }, [preProcessEvent, navigation, focusOutside]);

    const handleTabPrevious = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        const isFirstCell = datagridRefs.current.activeCell.col === 0;
        if (isFirstCell) {
            const isFirstRow = datagridRefs.current.activeCell.row === 0;
            if (isFirstRow) {
                navigation.existFocus();
                focusOutside('top');
                return;
            }
            navigation.goPrevRow();
            return;
        }

        navigation.goLeft();
    }, [preProcessEvent, navigation, focusOutside]);

    const handleArrowDown = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        navigation.goDown();
    }, [preProcessEvent, navigation]);

    const handleArrowUp = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        setEditing(false);

        navigation.goUp();
    }, [preProcessEvent, setEditing, navigation]);

    const handleArrowLeft = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        navigation.goLeft();
    }, [preProcessEvent, navigation]);

    const handleArrowRight = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        setEditing(false);

        navigation.goRight();
    }, [preProcessEvent, setEditing, navigation]);

    const handleJumpBottom = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        navigation.jumpDown();
    }, [preProcessEvent, navigation]);

    const handleJumpTop = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        navigation.jumpUp();
    }, [preProcessEvent, navigation]);

    const handleJumpLeft = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        navigation.jumpLeft();
    }, [preProcessEvent, navigation]);

    const handleJumpRight = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();
        navigation.jumpRight();
    }, [preProcessEvent, navigation]);

    const handleSelectRight = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        navigation.selectRight();
        setEditing(false);
    }, [preProcessEvent, navigation, setEditing]);

    const handleSelectLeft = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        navigation.selectLeft();
        setEditing(false);
    }, [preProcessEvent, navigation, setEditing]);

    const handleSelectDown = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        navigation.selectDown();
        setEditing(false);
    }, [preProcessEvent, navigation, setEditing]);

    const handleSelectUp = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        navigation.selectUp();
        setEditing(false);
    }, [preProcessEvent, navigation, setEditing]);

    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        event.preventDefault();

        if (!datagridRefs.current.editing && !datagridRefs.current.selection) {
            setActiveCell(null);
        }

        setSelectionCell(null);
    }, [preProcessEvent, setActiveCell, setSelectionCell]);

    const handleEdit = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;

        event.preventDefault();
        setSelectionCell(null);

        if (datagridRefs.current) {
            stopEditing();
            return;
        }

        if (!isCellDisabled(datagridRefs.current.activeCell)) {
            setLastEditingCell(datagridRefs.current.activeCell);
            setEditing(true);
            scrollTo(datagridRefs.current.activeCell);
        }
    }, [preProcessEvent, isCellDisabled, setLastEditingCell, setEditing, setSelectionCell, stopEditing, scrollTo]);

    const handleInsertRow = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;

        insertRowAfter(datagridRefs.current.selection?.max.row ?? datagridRefs.current.activeCell.row);
    }, [preProcessEvent, insertRowAfter]);

    const handleDuplicateRow = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;

        event.preventDefault();
        duplicateRows(datagridRefs.current.selection?.min.row ?? datagridRefs.current.activeCell.row, datagridRefs.current.selection?.max.row);
    }, [preProcessEvent, duplicateRows]);

    const handleDelete = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        if (datagridRefs.current.editing) return;

        event.preventDefault();
        deleteSelection();
    }, [preProcessEvent, deleteSelection]);

    const handleSelectAll = useCallback((event: KeyboardEvent) => {
        if (!preProcessEvent(event)) return;
        if (datagridRefs.current.editing) return;

        event.preventDefault();
        selectAll();
    }, [preProcessEvent, selectAll]);

    // Handle printable character input
    const handleKeydown = useCallback((event: KeyboardEvent) => {
        if (!datagridRefs.current.activeCell || datagridRefs.current) return;

        const isPureInput = (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) &&
            !event.ctrlKey && !event.metaKey && !event.altKey;
        const canInput = !isCellDisabled(datagridRefs.current.activeCell);

        if (isPureInput && canInput) {
            setLastEditingCell(datagridRefs.current.activeCell);
            setEditing(true);
            scrollTo(datagridRefs.current.activeCell);
        } else if (isPureInput && !canInput) {
            setLastEditingCell(datagridRefs.current.activeCell);
            navigation.existFocus();
            scrollTo(datagridRefs.current.activeCell);
        }
    }, [isCellDisabled, setLastEditingCell, setEditing, scrollTo, navigation]);

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
    }, [
        shortcuts,
        handleTabNext,
        handleTabPrevious,
        handleArrowDown,
        handleArrowUp,
        handleArrowLeft,
        handleArrowRight,
        handleJumpBottom,
        handleJumpTop,
        handleJumpLeft,
        handleJumpRight,
        handleEscape,
        handleEdit,
        handleInsertRow,
        handleDuplicateRow,
        handleDelete,
        handleSelectAll,
        handleKeydown
    ]);
};
