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

            // Tab from last cell of a row
            if (
                event.key === 'Tab' &&
                !event.shiftKey &&
                activeCell.col ===
                columns.length - (hasStickyRightColumn ? 3 : 2) &&
                !columns[activeCell.col + 1].disableKeys
            ) {
                // Last row
                if (activeCell.row === data.length - 1) {
                    if (afterTabIndexRef.current) {
                        event.preventDefault();

                        setActiveCell(null);
                        setSelectionCell(null);
                        setEditing(false);

                        const allElements = getAllTabbableElements();
                        const index = allElements.indexOf(afterTabIndexRef.current);

                        allElements[(index + 1) % allElements.length].focus();

                        return;
                    }
                } else {
                    setActiveCell((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }));
                    setSelectionCell(null);
                    setEditing(false);
                    event.preventDefault();

                    return;
                }
            }

            // Shift+Tab from first cell of a row
            if (
                event.key === 'Tab' &&
                event.shiftKey &&
                activeCell.col === 0 &&
                !columns[activeCell.col + 1].disableKeys
            ) {
                // First row
                if (activeCell.row === 0) {
                    if (beforeTabIndexRef.current) {
                        event.preventDefault();

                        setActiveCell(null);
                        setSelectionCell(null);
                        setEditing(false);

                        const allElements = getAllTabbableElements();
                        const index = allElements.indexOf(beforeTabIndexRef.current);

                        allElements[
                            (index - 1 + allElements.length) % allElements.length
                        ].focus();

                        return;
                    }
                } else {
                    setActiveCell((cell) => ({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: (cell?.row ?? 1) - 1,
                    }));
                    setSelectionCell(null);
                    setEditing(false);
                    event.preventDefault();

                    return;
                }
            }

            if (event.key?.startsWith('Arrow') || event.key === 'Tab') {
                if (editing && columns[activeCell.col + 1].disableKeys) {
                    return;
                }

                if (editing && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    return;
                }

                const add = (
                    [x, y]: [number, number],
                    cell: Cell | null
                ): Cell | null =>
                    cell && {
                        col: Math.max(
                            0,
                            Math.min(
                                columns.length - (hasStickyRightColumn ? 3 : 2),
                                cell.col + x
                            )
                        ),
                        row: Math.max(0, Math.min(data.length - 1, cell.row + y)),
                    };

                if (event.key === 'Tab' && event.shiftKey) {
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
                setEditing(false);

                event.preventDefault();
            } else if (event.key === 'Escape') {
                if (!editing && !selectionCell) {
                    setActiveCell(null);
                }

                setSelectionCell(null);
                setEditing(false);
            } else if (
                (event.key === 'Enter' || event.key === 'F2') &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                !event.shiftKey
            ) {
                setSelectionCell(null);

                if (editing) {
                    if (!columns[activeCell.col + 1].disableKeys) {
                        stopEditing();
                        event.preventDefault();
                    }
                } else if (!isCellDisabled(activeCell)) {
                    lastEditingCellRef.current = activeCell;
                    setEditing(true);
                    scrollTo(activeCell);
                    event.preventDefault();
                }
            } else if (
                event.key === 'Enter' &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                event.shiftKey
            ) {
                insertRowAfter(selection?.max.row || activeCell.row);
            } else if (
                event.key === 'd' &&
                (event.ctrlKey || event.metaKey) &&
                !event.altKey &&
                !event.shiftKey
            ) {
                duplicateRows(
                    selection?.min.row || activeCell.row,
                    selection?.max.row
                );
                event.preventDefault();
            } else if (
                (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {
                if (!editing && !isCellDisabled(activeCell)) {
                    lastEditingCellRef.current = activeCell;
                    setSelectionCell(null);
                    setEditing(true);
                    scrollTo(activeCell);
                }
            } else if (['Backspace', 'Delete'].includes(event.key)) {
                if (!editing) {
                    deleteSelection();
                    event.preventDefault();
                }
            } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
                if (!editing) {
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
                }
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
