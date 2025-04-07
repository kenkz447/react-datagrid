import { useCallback } from 'react';
import { Cell, RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';

export const useMouseDownHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const {
        contextMenu,
        setContextMenu,
        disableContextMenu,
        innerRef,
        getCursorIndex,
        setLastEditingCell,
        activeCell,
        editing,
        columns,
        data,
        hasStickyRightColumn,
        setActiveCell,
        setEditing,
        isCellDisabled,
        selection,
        setExpandingSelectionFromRowIndex,
        closeContextMenu
    } = datagrid;

    const {
        startDragging,
        setSelectionCell,
        cell: selectionCell,
        range: selectionRange,
    } = selection;

    const onMouseDown = useCallback(
        (event: MouseEvent) => {
            const clickInside = innerRef.current?.contains(event.target as Node) || false;

            if (contextMenu) {
                closeContextMenu();
                return;
            }

            const rightClick =
                event.button === 2 || (event.button === 0 && event.ctrlKey);

            if (
                !clickInside &&
                editing &&
                activeCell &&
                columns[activeCell.col + 1].keepFocus
            ) {
                return;
            }

            if (
                event.target instanceof HTMLElement &&
                event.target.className.includes('dsg-expand-rows-indicator')
            ) {
                setExpandingSelectionFromRowIndex(Math.max(activeCell?.row ?? 0, selectionRange?.max.row ?? 0));
                return;
            }

            const cursorIndex = clickInside
                ? getCursorIndex(event, true, true)
                : null;

            const clickOnActiveCell =
                cursorIndex &&
                activeCell &&
                activeCell.col === cursorIndex.col &&
                activeCell.row === cursorIndex.row &&
                !isCellDisabled(activeCell);

            if (clickOnActiveCell && editing) {
                return;
            }

            if (rightClick && !disableContextMenu) {
                setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    cursorIndex: cursorIndex as Cell,
                });
            }

            const clickOnStickyRightColumn =
                cursorIndex?.col === columns.length - 2 && hasStickyRightColumn;

            const rightClickInSelection =
                rightClick &&
                selection &&
                cursorIndex &&
                cursorIndex.row >= selectionRange?.min.row &&
                cursorIndex.row <= selectionRange?.max.row &&
                cursorIndex.col >= selectionRange?.min.col &&
                cursorIndex.col <= selectionRange?.max.col;

            const rightClickOnSelectedHeaders =
                rightClick &&
                selection &&
                cursorIndex &&
                cursorIndex.row === -1 &&
                cursorIndex.col >= selectionRange?.min.col &&
                cursorIndex.col <= selectionRange?.max.col;

            const rightClickOnSelectedGutter =
                rightClick &&
                selection &&
                cursorIndex &&
                cursorIndex.row >= selectionRange?.min.row &&
                cursorIndex.row <= selectionRange?.max.row &&
                cursorIndex.col === -1;

            const clickOnSelectedStickyRightColumn =
                clickOnStickyRightColumn &&
                selection &&
                cursorIndex &&
                cursorIndex.row >= selectionRange?.min.row &&
                cursorIndex.row <= selectionRange?.max.row;

            if ((!(event.shiftKey && activeCell) || rightClick) && data.length > 0) {
                setActiveCell(
                    cursorIndex && {
                        col: (rightClickInSelection || rightClickOnSelectedHeaders) &&
                            activeCell
                            ? activeCell.col
                            : Math.max(
                                0,
                                clickOnStickyRightColumn ? 0 : cursorIndex.col
                            ),
                        row: (rightClickInSelection ||
                            rightClickOnSelectedGutter ||
                            clickOnSelectedStickyRightColumn) &&
                            activeCell
                            ? activeCell.row
                            : Math.max(0, cursorIndex.row),
                        doNotScrollX: Boolean(
                            (rightClickInSelection && activeCell) ||
                            clickOnStickyRightColumn ||
                            cursorIndex.col === -1
                        ),
                        doNotScrollY: Boolean(
                            (rightClickInSelection && activeCell) ||
                            cursorIndex.row === -1
                        ),
                    }
                );
            }

            if (clickOnActiveCell && !rightClick) {
                setLastEditingCell(activeCell);
            }

            setEditing(Boolean(clickOnActiveCell && !rightClick));

            // Start user selection
            if (cursorIndex && !rightClick) {
                startDragging({
                    columns: (cursorIndex.col !== -1 && !clickOnStickyRightColumn) || Boolean(event.shiftKey && activeCell),
                    rows: cursorIndex.row !== -1 || Boolean(event.shiftKey && activeCell),
                });
            };

            if (event.shiftKey && activeCell && !rightClick) {
                setSelectionCell(
                    cursorIndex && {
                        col: Math.max(
                            0,
                            cursorIndex.col - (clickOnStickyRightColumn ? 1 : 0)
                        ),
                        row: Math.max(0, cursorIndex.row),
                    }
                );
            } else if (!rightClickInSelection) {
                if (
                    cursorIndex &&
                    (cursorIndex?.col === -1 ||
                        cursorIndex?.row === -1 ||
                        clickOnStickyRightColumn)
                ) {
                    let col = cursorIndex.col;
                    let row = cursorIndex.row;
                    let doNotScrollX = false;
                    let doNotScrollY = false;

                    if (cursorIndex.col === -1 || clickOnStickyRightColumn) {
                        col = columns.length - (hasStickyRightColumn ? 3 : 2);
                        doNotScrollX = true;
                    }

                    if (cursorIndex.row === -1) {
                        row = data.length - 1;
                        doNotScrollY = true;
                    }

                    if (rightClickOnSelectedHeaders && selectionCell) {
                        col = selectionCell.col;
                        doNotScrollY = true;
                    }

                    if (
                        (rightClickOnSelectedGutter ||
                            clickOnSelectedStickyRightColumn) &&
                        selectionCell
                    ) {
                        row = selectionCell.row;
                        doNotScrollX = true;
                    }

                    setSelectionCell({ col, row, doNotScrollX, doNotScrollY });
                } else {
                    setSelectionCell(null);
                }

                if (clickInside) {
                    event.preventDefault();
                }
            }
        },
        [innerRef, contextMenu, editing, activeCell, columns, getCursorIndex, isCellDisabled, disableContextMenu, hasStickyRightColumn, selection, selectionRange?.min.row, selectionRange?.min.col, selectionRange?.max.row, selectionRange?.max.col, data.length, setEditing, closeContextMenu, setExpandingSelectionFromRowIndex, setContextMenu, setActiveCell, setLastEditingCell, startDragging, setSelectionCell, selectionCell]
    );

    return onMouseDown;
};
