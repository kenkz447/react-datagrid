import { useCallback } from 'react';
import { isPrintableUnicode } from '../../utils/copyPasting';
import { Cell, useDatagridContext } from '../../../core';

interface UseKeydownHandlerProps {
    scrollTo,
    onFocusOutside?: (direction: 'top' | 'bottom') => void;
};


export const useKeydownHandler = ({
    scrollTo,
    onFocusOutside
}: UseKeydownHandlerProps) => {
    const {
        lastEditingCellRef,
        activeCell,
        columns,
        data,
        editing,
        hasStickyRightColumn,
        insertRowAfter,
        isCellDisabled,
        setActiveCell,
        setEditing,
        selectionCell,
        setSelectionCell,
        stopEditing,
        selection,
        deleteSelection,
        duplicateRows
    } = useDatagridContext();

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!activeCell) {
                return;
            }

            if (event.isComposing) {
                return;
            }

            const disableKeys = columns[activeCell.col + 1].disableKeys;
            if (disableKeys) {
                return;
            }

            const isArrows = event.key.startsWith('Arrow');
            if (editing && isArrows) {
                if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    return;
                }
            }

            if (event.key === 'Tab' || event.key === 'Enter' || event.key.startsWith('Arrow')) {
                setEditing(false);
            }

            const focusController = {
                removeFocus: () => {
                    setActiveCell(null);
                    setSelectionCell(null);
                },
                focusPrevRow: () => {
                    setActiveCell((cell) => ({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: (cell?.row ?? 1) - 1,
                    }));
                    setSelectionCell(null);
                },
                focusNextRow: () => {
                    setActiveCell((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }));
                    setSelectionCell(null);
                },
                selectAll: () => {
                    setActiveCell({
                        col: 0,
                        row: 0,
                        doNotScrollY: true,
                        doNotScrollX: true,
                    });
                    setSelectionCell({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: data.length - 1,
                        doNotScrollY: true,
                        doNotScrollX: true,
                    });
                }
            };

            const add = ([x, y]: [number, number], cell: Cell | null): Cell | null => cell && {
                col: Math.max(0, Math.min(columns.length - (hasStickyRightColumn ? 3 : 2), cell.col + x)),
                row: Math.max(0, Math.min(data.length - 1, cell.row + y)),
            };

            // Tab from last cell of a row
            const isTab = event.key === 'Tab';
            const isPureTab = isTab && !event.shiftKey;
            if (isPureTab) {
                event.preventDefault();
                const isLastCell = activeCell.col === columns.length - (hasStickyRightColumn ? 3 : 2);
                if (isLastCell) {
                    const isLastRow = activeCell.row === data.length - 1;
                    if (isLastRow) {
                        focusController.removeFocus();
                        return onFocusOutside?.('bottom');
                    }
                    return focusController.focusNextRow();
                }

                setActiveCell((cell) => add([1, 0], cell));
                setSelectionCell(null);
                return;
            }

            // Shift+Tab from first cell of a row
            const isShiftTab = isTab && event.shiftKey;
            if (isShiftTab) {
                event.preventDefault();
                const isFirstCell = activeCell.col === 0;
                if (isFirstCell) {
                    const isFirstRow = activeCell.row === 0;
                    if (isFirstRow) {
                        focusController.removeFocus();
                        return onFocusOutside?.('top');
                    }
                    return focusController.focusPrevRow();
                }

                event.preventDefault();
                setActiveCell((cell) => add([-1, 0], cell));
                setSelectionCell(null);
                return;
            }

            if (isArrows) {
                event.preventDefault();

                const direction = {
                    ArrowDown: [0, 1],
                    ArrowUp: [0, -1],
                    ArrowLeft: [-1, 0],
                    ArrowRight: [1, 0]
                }[event.key] as [number, number];

                if (event.ctrlKey || event.metaKey) {
                    direction[0] *= columns.length;
                    direction[1] *= data.length;
                }

                if (event.shiftKey) {
                    setSelectionCell((cell) => add(direction, cell || activeCell));
                    return;
                }

                setActiveCell((cell) => add(direction, cell));
                setSelectionCell(null);
                return;
            }

            if (event.key === 'Escape') {
                if (!editing && !selectionCell) {
                    setActiveCell(null);
                }

                setSelectionCell(null);
                return;
            }

            if (
                (event.key === 'Enter' || event.key === 'F2') &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                !event.shiftKey
            ) {
                setSelectionCell(null);
                event.preventDefault();

                if (editing) {
                    stopEditing();
                    return;
                }
                if (!isCellDisabled(activeCell)) {
                    lastEditingCellRef.current = activeCell;
                    setEditing(true);
                    scrollTo(activeCell);
                }
                return;
            }

            const isShiftEnter = event.key === 'Enter' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
            if (isShiftEnter) {
                insertRowAfter(selection?.max.row ?? activeCell.row);
                return;
            }

            const isCtrlD = event.key === 'd' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
            if (isCtrlD) {
                duplicateRows(selection?.min.row ?? activeCell.row, selection?.max.row);
                event.preventDefault();
                return;
            }

            const isPureInput = (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) && !event.ctrlKey && !event.metaKey && !event.altKey;
            const canInput = !isCellDisabled(activeCell);
            if (isPureInput && !editing && !canInput) {
                lastEditingCellRef.current = activeCell;
                focusController.removeFocus();
                scrollTo(activeCell);
                return;
            }

            const isDelete = ['Backspace', 'Delete'].includes(event.key);
            if (isDelete && !editing) {
                deleteSelection();
                event.preventDefault();
                return;
            }

            const isControlA = event.key === 'a' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
            if (isControlA && !editing) {
                focusController.selectAll();
                event.preventDefault();
                return;
            }
        },
        [
            activeCell,
            columns,
            data.length,
            deleteSelection,
            duplicateRows,
            editing,
            insertRowAfter,
            isCellDisabled,
            scrollTo,
            selection?.max.row,
            selection?.min.row,
            selectionCell,
            setActiveCell,
            setSelectionCell,
            stopEditing,
            hasStickyRightColumn,
        ]
    );

    return onKeyDown;
};
