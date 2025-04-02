import { useCallback } from 'react';
import { Cell, useDatagridContext } from '../../../core';

interface UseMouseDownHandlerProps {
    contextMenu,
    contextMenuItems,
    setContextMenu,
    disableContextMenu,
    innerRef,
    getCursorIndex,
}

export const useMouseDownHandler = ({
    contextMenu,
    contextMenuItems,
    setContextMenu,
    disableContextMenu,
    innerRef,
    getCursorIndex
}: UseMouseDownHandlerProps) => {
    const {
        lastEditingCellRef,
        activeCell,
        editing,
        columns,
        data,
        hasStickyRightColumn,
        setActiveCell,
        setEditing,
        setSelectionMode,
        setSelectionCell,
        selectionCell,
        isCellDisabled,
        selection,
        setExpandingSelectionFromRowIndex
    } = useDatagridContext();

    const onMouseDown = useCallback(
        (event: MouseEvent) => {
            if (contextMenu && contextMenuItems.length) {
                return;
            }

            const rightClick =
                event.button === 2 || (event.button === 0 && event.ctrlKey);
            const clickInside =
                innerRef.current?.contains(event.target as Node) || false;

            const cursorIndex = clickInside
                ? getCursorIndex(event, true, true)
                : null;

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
                setExpandingSelectionFromRowIndex(
                    Math.max(activeCell?.row ?? 0, selection?.max.row ?? 0)
                );
                return;
            }

            const clickOnActiveCell =
                cursorIndex &&
                activeCell &&
                activeCell.col === cursorIndex.col &&
                activeCell.row === cursorIndex.row &&
                !isCellDisabled(activeCell);

            if (clickOnActiveCell && editing) {
                return;
            }

            const clickOnStickyRightColumn =
                cursorIndex?.col === columns.length - 2 && hasStickyRightColumn;

            const rightClickInSelection =
                rightClick &&
                selection &&
                cursorIndex &&
                cursorIndex.row >= selection.min.row &&
                cursorIndex.row <= selection.max.row &&
                cursorIndex.col >= selection.min.col &&
                cursorIndex.col <= selection.max.col;

            const rightClickOnSelectedHeaders =
                rightClick &&
                selection &&
                cursorIndex &&
                cursorIndex.row === -1 &&
                cursorIndex.col >= selection.min.col &&
                cursorIndex.col <= selection.max.col;

            const rightClickOnSelectedGutter =
                rightClick &&
                selection &&
                cursorIndex &&
                cursorIndex.row >= selection.min.row &&
                cursorIndex.row <= selection.max.row &&
                cursorIndex.col === -1;

            const clickOnSelectedStickyRightColumn =
                clickOnStickyRightColumn &&
                selection &&
                cursorIndex &&
                cursorIndex.row >= selection.min.row &&
                cursorIndex.row <= selection.max.row;

            if (rightClick && !disableContextMenu) {
                setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    cursorIndex: cursorIndex as Cell,
                });
            }

            if (
                (!(event.shiftKey && activeCell) || rightClick) &&
                data.length > 0
            ) {
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
                lastEditingCellRef.current = activeCell;
            }

            setEditing(Boolean(clickOnActiveCell && !rightClick));
            setSelectionMode(
                cursorIndex && !rightClick
                    ? {
                        columns: (cursorIndex.col !== -1 && !clickOnStickyRightColumn) || Boolean(event.shiftKey && activeCell),
                        rows: cursorIndex.row !== -1 || Boolean(event.shiftKey && activeCell),
                        active: true,
                    }
                    : {
                        columns: false,
                        rows: false,
                        active: false,
                    }
            );

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
        [
            contextMenu,
            contextMenuItems.length,
            getCursorIndex,
            editing,
            activeCell,
            columns,
            isCellDisabled,
            selection,
            hasStickyRightColumn,
            disableContextMenu,
            setSelectionMode,
            setActiveCell,
            setSelectionCell,
            selectionCell,
            data.length,
        ]
    );

    return onMouseDown;
};
