import { useCallback } from 'react';
import { UseDatagridReturn } from '../useDatagrid';
import { useDocumentEventListener } from '../useDocumentEventListener';
import { RowData } from '../../../core';

export const useDragSelectHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const {
        innerRef,
        getCursorIndex,
        activeCell,
        selection,
        hasStickyRightColumn,
        columns,
    } = datagrid;

    const { startDragging, stopDragging } = selection;

    const startDragSelect = useCallback(
        (event: MouseEvent) => {
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
        },
        [activeCell, columns.length, getCursorIndex, hasStickyRightColumn, innerRef, startDragging]
    );

    const stopDragSelect = useCallback(() => {
        stopDragging();
    }, [stopDragging]);

    useDocumentEventListener('mousedown', startDragSelect);
    useDocumentEventListener('mouseup', stopDragSelect);
};
