import { useCallback } from 'react';
import { RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';


export const useContextMenuHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const {
        innerRef,
        getCursorIndex,
        activeCell,
        editing
    } = datagrid;

    const onContextMenu = useCallback(
        (event: MouseEvent) => {
            const clickInside =
                innerRef.current?.contains(event.target as Node) || false;

            const cursorIndex = clickInside
                ? getCursorIndex(event, true, true)
                : null;

            const clickOnActiveCell =
                cursorIndex &&
                activeCell &&
                activeCell.col === cursorIndex.col &&
                activeCell.row === cursorIndex.row &&
                editing;

            if (clickInside && !clickOnActiveCell) {
                event.preventDefault();
            }
        },
        [getCursorIndex, activeCell, editing]
    );

    return onContextMenu;
};
