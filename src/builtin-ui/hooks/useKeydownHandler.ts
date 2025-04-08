import React, { useEffect, useRef } from 'react';
import { tinykeys, type KeyBindingMap } from 'tinykeys';
import { UseDatagridReturn, isPrintableUnicode, useDocumentEventListener } from '../../browser';

import { RowData } from '../../core';

// Define keyboard action types
export type KeyboardAction =
    | 'tabNext'
    | 'tabPrevious'
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
    tabNext: 'Tab',
    tabPrevious: 'Shift+Tab',
    goBottom: 'ArrowDown',
    goUp: 'ArrowUp',
    goLeft: ['ArrowLeft'],
    goRight: ['ArrowRight'],
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

    // Define handler for preprocessing events
    const preProcessEvent = useRef((event: KeyboardEvent): boolean => {
        if (!refs.current.activeCell || event.isComposing) return false;

        const disableKeys = refs.current.columns[refs.current.activeCell.col + 1]?.disableKeys;
        if (disableKeys) return false;

        if (refs.current.editing && event.key.startsWith('Arrow')) {
            if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                return false;
            }
        }

        return true;
    });

    // Define handler functions for each keyboard action
    const handleTabNext = useRef(() => {
        const isLastCell = refs.current.activeCell.col === refs.current.columns.length - (refs.current.hasStickyRightColumn ? 3 : 2);
        if (isLastCell) {
            const isLastRow = refs.current.activeCell.row === refs.current.data.length - 1;
            if (isLastRow) {
                refs.current.selection.existFocus();
                return;
            }
            refs.current.selection.goNextRow();
            return;
        }

        refs.current.selection.goRight();
    });

    const handleTabPrevious = useRef(() => {
        const isFirstCell = refs.current.activeCell.col === 0;
        if (isFirstCell) {
            const isFirstRow = refs.current.activeCell.row === 0;
            if (isFirstRow) {
                refs.current.selection.existFocus();
                return;
            }
            refs.current.selection.goPrevRow();
            return;
        }

        refs.current.selection.goLeft();
    });

    const handleArrowDown = useRef(() => {
        setEditing(false);
        refs.current.selection.goDown();
    });

    const handleArrowUp = useRef(() => {
        setEditing(false);
        refs.current.selection.goUp();
    });

    const handleArrowLeft = useRef(() => {
        refs.current.selection.goLeft();
    });

    const handleArrowRight = useRef(() => {
        setEditing(false);
        refs.current.selection.goRight();
    });

    const handleJumpBottom = useRef(() => {
        refs.current.selection.jumpDown();
    });

    const handleJumpTop = useRef(() => {
        refs.current.selection.jumpUp();
    });

    const handleJumpLeft = useRef(() => {
        refs.current.selection.jumpLeft();
    });

    const handleJumpRight = useRef(() => {
        refs.current.selection.jumpRight();
    });

    const handleSelectRight = useRef(() => {
        refs.current.selection.selectRight();
        setEditing(false);
    });

    const handleSelectLeft = useRef(() => {
        refs.current.selection.selectLeft();
        setEditing(false);
    });

    const handleSelectDown = useRef(() => {
        refs.current.selection.selectDown();
        setEditing(false);
    });

    const handleSelectUp = useRef(() => {
        refs.current.selection.selectUp();
        setEditing(false);
    });

    const handleEscape = useRef(() => {
        if (!refs.current.editing && !refs.current.selection) {
            setActiveCell(null);
        }

        refs.current.selection.setSelectionCell(null);
    });

    const handleInsertRow = useRef(() => {
        insertRowAfter(refs.current.selection.range?.max.row ?? refs.current.activeCell.row);
    });

    const handleDuplicateRow = useRef(() => {
        duplicateRows(
            refs.current.selection.range?.min.row ?? refs.current.activeCell.row,
            refs.current.selection.range?.max.row
        );
    });

    const handleDelete = useRef(() => {
        if (refs.current.editing) {
            return false;
        };
        deleteSelection();
    });

    const handleSelectAll = useRef(() => {
        if (refs.current.editing) {
            return false;
        };
        refs.current.selection.selectAll();
    });

    const handleEdit = useRef(() => {
        refs.current.selection.setSelectionCell(null);

        if (refs.current.editing) {
            stopEditing();
            return;
        }

        if (!isCellDisabled(refs.current.activeCell)) {
            setLastEditingCell(refs.current.activeCell);
            setEditing(true);
            scrollTo(refs.current.activeCell);
        }
    });

    // Handle printable character input
    const handleInput = useRef((event: KeyboardEvent) => {
        if (!refs.current.activeCell || refs.current.editing) return;

        const isPureInput = (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) && !event.ctrlKey && !event.metaKey && !event.altKey;
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
    });

    useEffect(() => {
        const handlers = {
            tabNext: handleTabNext.current,
            tabPrevious: handleTabPrevious.current,
            goBottom: handleArrowDown.current,
            goUp: handleArrowUp.current,
            goLeft: handleArrowLeft.current,
            goRight: handleArrowRight.current,
            jumpBottom: handleJumpBottom.current,
            jumpTop: handleJumpTop.current,
            jumpLeft: handleJumpLeft.current,
            jumpRight: handleJumpRight.current,
            selectRight: handleSelectRight.current,
            selectLeft: handleSelectLeft.current,
            selectDown: handleSelectDown.current,
            selectUp: handleSelectUp.current,
            selectAll: handleSelectAll.current,
            escape: handleEscape.current,
            edit: handleEdit.current,
            insertRow: handleInsertRow.current,
            duplicateRow: handleDuplicateRow.current,
            delete: handleDelete.current,
        };

        // Define keybindings
        const keyBindings: KeyBindingMap = {};

        // Helper to add a keybinding for an action
        const addKeybinding = (action: string, handler: (event: KeyboardEvent) => void | boolean) => {
            const shortcutKeys = shortcuts[action];
            if (!shortcutKeys) return;

            const keys = Array.isArray(shortcutKeys) ? shortcutKeys : [shortcutKeys];
            keys.forEach(key => {
                keyBindings[key] = (event => {
                    if (!preProcessEvent.current(event)) return;
                    const handled = handler(event);
                    if (handled === false) {
                        return;
                    }
                    event.preventDefault();
                });
            });
        };

        Object.entries(handlers).forEach(([action, handler]) => {
            addKeybinding(action, handler);
        });

        const cleanKeyBindings = tinykeys(window, keyBindings);

        return () => {
            cleanKeyBindings();
        };
    }, [shortcuts]);

    useDocumentEventListener('keydown', handleInput.current);
};
