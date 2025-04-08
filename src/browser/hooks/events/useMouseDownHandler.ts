import { useRef } from 'react';
import { RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';
import { useDocumentEventListener } from '../useDocumentEventListener';

export const useMouseDownHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const refs = useRef(datagrid);
    refs.current = datagrid;

    const onMouseDown = useRef(
        (event: MouseEvent) => {
            const {
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
            } = refs.current;
        
            const {
                setSelectionCell,
                cell: selectionCell,
                range: selectionRange,
            } = selection;

            const clickInside = innerRef.current?.contains(event.target as Node) || false;

            const rightClick = event.button === 2 || (event.button === 0 && event.ctrlKey);

            if (!clickInside && editing && activeCell && columns[activeCell.col + 1].keepFocus) {
                return;
            }

            if (
                event.target instanceof HTMLElement &&
                event.target.className.includes('dsg-expand-rows-indicator')
            ) {
                setExpandingSelectionFromRowIndex(Math.max(activeCell?.row ?? 0, selectionRange?.max.row ?? 0));
                return;
            }

            const cursorIndex = clickInside ? getCursorIndex(event, true, true) : null;

            if (!cursorIndex) {
                setSelectionCell(null);
                setActiveCell(null);
                return;
            }

            const clickOnActiveCell = activeCell && activeCell.col === cursorIndex.col && activeCell.row === cursorIndex.row && !isCellDisabled(activeCell);

            if (clickOnActiveCell && editing) {
                return;
            }

            const clickOnStickyRightColumn = cursorIndex.col === columns.length - 2 && hasStickyRightColumn;

            if (rightClick) {
                return;
            }

            if (clickOnActiveCell) {
                setLastEditingCell(activeCell);
                setEditing(Boolean(clickOnActiveCell && !rightClick));
                return;
            }

            const isExpandingSelection = event.shiftKey && activeCell;
            if (isExpandingSelection) {
                setSelectionCell({
                    col: Math.max(0, cursorIndex.col - (clickOnStickyRightColumn ? 1 : 0)),
                    row: Math.max(0, cursorIndex.row),
                });
                return;
            }

            const clickOnSelectedStickyRightColumn =
                clickOnStickyRightColumn &&
                selection &&
                cursorIndex.row >= selectionRange?.min.row &&
                cursorIndex.row <= selectionRange?.max.row;

            setActiveCell({
                col: Math.max(0, clickOnStickyRightColumn ? 0 : cursorIndex.col),
                row: Math.max(0, cursorIndex.row),
                doNotScrollX: Boolean(clickOnStickyRightColumn || cursorIndex.col === -1),
                doNotScrollY: Boolean(cursorIndex.row === -1),
            });

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

                if ((clickOnSelectedStickyRightColumn) && selectionCell) {
                    row = selectionCell.row;
                    doNotScrollX = true;
                }

                setSelectionCell({ col, row, doNotScrollX, doNotScrollY });
            }
            else {
                setSelectionCell(null);
            }
        }
    );

    useDocumentEventListener('mousedown', onMouseDown.current);
};
