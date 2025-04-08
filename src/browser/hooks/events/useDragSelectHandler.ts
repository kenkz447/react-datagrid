import { useRef } from 'react';
import { UseDatagridReturn } from '../useDatagrid';
import { useDocumentEventListener } from '../useDocumentEventListener';
import { RowData } from '../../../core';

export const useDragSelectHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const refs = useRef(datagrid);
    refs.current = datagrid;

    const startDragSelect = useRef((event: MouseEvent) => {
        const {
            innerRef,
            getCursorIndex,
            activeCell,
            selection,
            hasStickyRightColumn,
            columns,
        } = refs.current;

        const { startDragging } = selection;

        const clickInside = innerRef.current?.contains(event.target as Node) || false;
        if (!clickInside) {
            return;
        }

        const rightClick = event.button === 2 || (event.button === 0 && event.ctrlKey);
        const cursorIndex = getCursorIndex(event, true, true);
        if (!cursorIndex || rightClick) {
            return;
        }

        const clickOnStickyRightColumn =
            cursorIndex?.col === columns.length - 2 && hasStickyRightColumn;

        startDragging({
            columns: (cursorIndex.col !== -1 && !clickOnStickyRightColumn) || Boolean(event.shiftKey && activeCell),
            rows: cursorIndex.row !== -1 || Boolean(event.shiftKey && activeCell),
        });
    });

    const onMouseMove = useRef((event: MouseEvent) => {
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
        const { selection } = refs.current;
        const { stopDragging } = selection;
        stopDragging();
    });

    useDocumentEventListener('mousedown', startDragSelect.current);
    useDocumentEventListener('mousemove', onMouseMove.current);
    useDocumentEventListener('mouseup', stopDragSelect.current);
};
