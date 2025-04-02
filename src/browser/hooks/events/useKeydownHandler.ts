import { useCallback } from 'react';
import { getAllTabbableElements } from '../../utils/tab';
import { isPrintableUnicode } from '../../utils/copyPasting';
import { Cell, useDatagridContext } from '../../../core';

interface UseKeydownHandlerProps {
    scrollTo,
    beforeTabIndexRef,
    afterTabIndexRef,
    lastEditingCellRef
};

export const useKeydownHandler = ({
    scrollTo,
    beforeTabIndexRef,
    afterTabIndexRef,
    lastEditingCellRef
}: UseKeydownHandlerProps) => {
    const {
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

            if (event.key === 'Tab' || event.key === 'Enter' || event.key.startsWith('Arrow')) {
                setEditing(false);
            }

            const disableKeys = columns[activeCell.col + 1].disableKeys;

            const focusController = {
                goOutFromFirst: () => {
                    setActiveCell(null);
                    setSelectionCell(null);
                    const allElements = getAllTabbableElements();
                    const index = allElements.indexOf(beforeTabIndexRef.current);
                    allElements[(index - 1 + allElements.length) % allElements.length].focus();
                },
                goOutFromLast: () => {
                    setActiveCell(null);
                    setSelectionCell(null);
                    const allElements = getAllTabbableElements();
                    const index = allElements.indexOf(afterTabIndexRef.current);
                    allElements[(index + 1) % allElements.length].focus();
                },
                goPrevRow: () => {
                    setActiveCell((cell) => ({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: (cell?.row ?? 1) - 1,
                    }));
                    setSelectionCell(null);
                },
                goNextRow: () => {
                    setActiveCell((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }));
                    setSelectionCell(null);
                }
            };

            // Tab from last cell of a row
            const isTab = event.key === 'Tab';
            const isPureTab = isTab && !event.shiftKey;
            const isLastCell = activeCell.col === columns.length - (hasStickyRightColumn ? 3 : 2);
            if (isPureTab && isLastCell && !disableKeys) {
                event.preventDefault();
                const isLastRow = activeCell.row === data.length - 1;
                if (isLastRow) {
                    if (afterTabIndexRef.current) {
                        return focusController.goOutFromLast();
                    }
                } else {
                    return focusController.goNextRow();
                }
            }

            // Shift+Tab from first cell of a row
            const isShiftTab = isTab && event.shiftKey;
            const isFirstCell = activeCell.col === 0 && !columns[activeCell.col + 1].disableKeys;
            if (isShiftTab && isFirstCell) {
                event.preventDefault();
                const isFirstRow = activeCell.row === 0;
                if (isFirstRow) {
                    if (beforeTabIndexRef.current) {
                        return focusController.goOutFromFirst();
                    }
                } else {
                    return focusController.goPrevRow();
                }
            }

            const isArrows = event.key.startsWith('Arrow');

            if (editing && (isArrows || isPureTab)) {
                if (disableKeys) {
                    return;
                }

                if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    return;
                }
            }

            if (isArrows || isTab) {
                const add = ([x, y]: [number, number], cell: Cell | null): Cell | null => cell && {
                    col: Math.max(0, Math.min(columns.length - (hasStickyRightColumn ? 3 : 2), cell.col + x)),
                    row: Math.max(0, Math.min(data.length - 1, cell.row + y)),
                };

                if (isShiftTab) {
                    setActiveCell((cell) => add([-1, 0], cell));
                    setSelectionCell(null);
                } else {
                    const direction = {
                        ArrowDown: [0, 1],
                        ArrowUp: [0, -1],
                        ArrowLeft: [-1, 0],
                        ArrowRight: [1, 0],
                        Tab: [1, 0],
                    }[event.key] as [number, number];

                    if (event.ctrlKey || event.metaKey) {
                        direction[0] *= columns.length;
                        direction[1] *= data.length;
                    }

                    if (event.shiftKey) {
                        setSelectionCell((cell) => add(direction, cell || activeCell));
                    } else {
                        setActiveCell((cell) => add(direction, cell));
                        setSelectionCell(null);
                    }
                }

                event.preventDefault();
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

                if (editing && !columns[activeCell.col + 1].disableKeys) {
                    stopEditing();
                    event.preventDefault();
                } else if (!isCellDisabled(activeCell)) {
                    lastEditingCellRef.current = activeCell;
                    setEditing(true);
                    scrollTo(activeCell);
                    event.preventDefault();
                }

                return;
            }

            const isShiftEnter = event.key === 'Enter' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
            if (isShiftEnter) {
                insertRowAfter(selection?.max.row || activeCell.row);
                return;
            }

            const isCtrlD = event.key === 'd' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
            if (isCtrlD) {
                duplicateRows(
                    selection?.min.row || activeCell.row,
                    selection?.max.row
                );
                event.preventDefault();
                return;
            }

            if (
                (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                !editing &&
                !isCellDisabled(activeCell)
            ) {
                lastEditingCellRef.current = activeCell;
                setSelectionCell(null);
                setEditing(true);
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
