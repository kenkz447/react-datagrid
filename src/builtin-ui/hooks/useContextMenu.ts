import { useRef } from 'react';
import { UseDatagridReturn, useDocumentEventListener } from '../../browser';
import { RowData, Cell } from '../../core';

export const useContextMenu = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const refs = useRef(datagrid);
    refs.current = datagrid;

    const hideDefaultContextMenu = useRef((event: MouseEvent) => {
        const { innerRef, activeCell, editing, disableContextMenu, getCursorIndex } = refs.current;

        const clickInside = innerRef.current?.contains(event.target as Node) || false;
        if (!clickInside) {
            return;
        }

        const cursorIndex = getCursorIndex(event, true, true);

        const clickOnActiveCell =
            cursorIndex &&
            activeCell &&
            activeCell.col === cursorIndex.col &&
            activeCell.row === cursorIndex.row &&
            editing;

        if (clickOnActiveCell || disableContextMenu) {
            return;
        }

        // Prevent the default context menu from showing
        event.preventDefault();
    });

    const tryOpenContextMenu = useRef((event: MouseEvent) => {
        const { contextMenu, innerRef, activeCell, selection, columns, hasStickyRightColumn, data, closeContextMenu, getCursorIndex, setActiveCell, setContextMenu } = refs.current;

        if (contextMenu) {
            return closeContextMenu();
        }

        const clickInside = innerRef.current?.contains(event.target as Node) || false;
        if (!clickInside) {
            return;
        }

        const cursorIndex = getCursorIndex(event, true, true);
        const rightClick = event.button === 2 || (event.button === 0 && event.ctrlKey);
        if (!rightClick) {
            return;
        }

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            cursorIndex: cursorIndex as Cell,
        });

        const {
            range: selectionRange,
            cell: selectionCell,
            setSelectionCell
        } = selection;

        const clickOnStickyRightColumn = cursorIndex.col === columns.length - 2 && hasStickyRightColumn;

        const rightClickInSelection =
            selectionRange &&
            cursorIndex.row >= selectionRange?.min.row &&
            cursorIndex.row <= selectionRange?.max.row &&
            cursorIndex.col >= selectionRange?.min.col &&
            cursorIndex.col <= selectionRange?.max.col;

        const rightClickOnSelectedHeaders =
            selectionRange &&
            cursorIndex.row === -1 &&
            cursorIndex.col >= selectionRange?.min.col &&
            cursorIndex.col <= selectionRange?.max.col;

        const rightClickOnSelectedGutter =
            selectionRange &&
            cursorIndex.row >= selectionRange?.min.row &&
            cursorIndex.row <= selectionRange?.max.row &&
            cursorIndex.col === -1;

        // Set the active cell to the clicked cell
        if (activeCell) {
            setActiveCell({
                col: (rightClickInSelection || rightClickOnSelectedHeaders)
                    ? activeCell.col
                    : Math.max(0, clickOnStickyRightColumn ? 0 : cursorIndex.col),
                row: (rightClickInSelection || rightClickOnSelectedGutter)
                    ? activeCell.row
                    : Math.max(0, cursorIndex.row),
                doNotScrollX: Boolean(rightClickInSelection || clickOnStickyRightColumn || cursorIndex.col === -1),
                doNotScrollY: Boolean(rightClickInSelection || cursorIndex.row === -1),
            });
        }
        else {
            setActiveCell({
                col: Math.max(0, clickOnStickyRightColumn ? 0 : cursorIndex.col),
                row: Math.max(0, cursorIndex.row),
                doNotScrollX: Boolean(clickOnStickyRightColumn || cursorIndex.col === -1),
                doNotScrollY: Boolean(cursorIndex.row === -1),
            });
        }

        // Set the selection cell to the clicked cell
        if (rightClickInSelection) {
            setSelectionCell({
                col: Math.max(0, cursorIndex.col - (clickOnStickyRightColumn ? 1 : 0)),
                row: Math.max(0, cursorIndex.row),
            });
        }
        else {
            if ((cursorIndex.col === -1 || cursorIndex.row === -1 || clickOnStickyRightColumn)) {
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

                if ((rightClickOnSelectedGutter) && selectionCell) {
                    row = selectionCell.row;
                    doNotScrollX = true;
                }

                setSelectionCell({ col, row, doNotScrollX, doNotScrollY });
            }
        }
    });

    useDocumentEventListener('contextmenu', hideDefaultContextMenu.current);
    useDocumentEventListener('mousedown', tryOpenContextMenu.current);
};
