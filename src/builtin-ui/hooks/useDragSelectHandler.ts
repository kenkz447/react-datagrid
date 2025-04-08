import { useRef } from 'react';
import { UseDatagridReturn, useDocumentEventListener } from '../../browser';
import { RowData } from '../../core';

const delay = 150; // ms

export const useDragSelectHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const refs = useRef(datagrid);
    refs.current = datagrid;

    const isDraggingRef = useRef(false);

    const getDraggingCell = useRef((event: MouseEvent) => {
        const {
            innerRef,
            getCursorIndex,
            activeCell,
            hasStickyRightColumn,
            columns,
        } = refs.current;

        const clickInside = innerRef.current?.contains(event.target as Node) || false;
        if (!clickInside) {
            return;
        }

        const cursorIndex = getCursorIndex(event, true, true);
        if (!cursorIndex) {
            return;
        }

        const clickOnActiveCell = activeCell && activeCell.col === cursorIndex.col && activeCell.row === cursorIndex.row;
        if (clickOnActiveCell) {
            return;
        }

        const clickOnStickyRightColumn = cursorIndex?.col === columns.length - 2 && hasStickyRightColumn;

        return {
            columns: (cursorIndex.col !== -1 && !clickOnStickyRightColumn) || Boolean(event.shiftKey && activeCell),
            rows: cursorIndex.row !== -1 || Boolean(event.shiftKey && activeCell),
        };
    });

    const startDragSelect = useRef((event: MouseEvent) => {
        const draggingCell = getDraggingCell.current(event);
        if (!draggingCell) {
            return;
        }

        isDraggingRef.current = true;

        setTimeout(() => {
            if (!isDraggingRef.current) {
                return;
            }

            const { selection } = refs.current;

            selection.startDragging(draggingCell);
        }, delay);
    });

    const onMouseMove = useRef((event: MouseEvent) => {
        if (!isDraggingRef.current) {
            return;
        }

        const {
            data,
            getCursorIndex,
            setEditing,
            selection,
            hasStickyRightColumn,
            columns,
        } = refs.current;

        const { dragging, setSelectionCell } = selection;

        if (dragging.active) {
            const cursorIndex = getCursorIndex(event);

            const lastColumnIndex =
                columns.length - (hasStickyRightColumn ? 3 : 2);

            setSelectionCell(
                cursorIndex && {
                    col: dragging.columns
                        ? Math.max(0, Math.min(lastColumnIndex, cursorIndex.col))
                        : lastColumnIndex,
                    row: dragging.rows
                        ? Math.max(0, cursorIndex.row)
                        : data.length - 1,
                    doNotScrollX: !dragging.columns,
                    doNotScrollY: !dragging.rows,
                }
            );
            setEditing(false);
        }
    });

    const stopDragSelect = useRef(() => {
        if (isDraggingRef.current) {
            const { selection } = refs.current;
            const { stopDragging } = selection;
            stopDragging();
        }

        isDraggingRef.current = false;
    });

    useDocumentEventListener('mousedown', startDragSelect.current);
    useDocumentEventListener('mousemove', onMouseMove.current);
    useDocumentEventListener('mouseup', stopDragSelect.current);
};
