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

    /**
     * Prevents the default context menu behavior based on click position.
     * 
     * This handler determines whether to allow or prevent the browser's default context menu
     * by checking if the click:
     * 1. Occurred inside the component's boundaries
     * 2. Was not on an active cell that is currently being edited
     * 
     * If both conditions are met, the default context menu behavior is prevented.
     */
    const tryPreventContextMenu = useCallback((event: MouseEvent) => {
        const clickInside = innerRef.current?.contains(event.target as Node) || false;
        if(!clickInside) {
            return;
        }

        const cursorIndex = getCursorIndex(event, true, true);

        const clickOnActiveCell =
            cursorIndex &&
            activeCell &&
            activeCell.col === cursorIndex.col &&
            activeCell.row === cursorIndex.row &&
            editing;

        if (clickOnActiveCell) {
            return;
        }

        event.preventDefault();
    }, [innerRef, getCursorIndex, activeCell, editing]);

    const contextMenuHandler = useCallback(
        (event: MouseEvent) => {
            tryPreventContextMenu(event);
        },
        [tryPreventContextMenu]
    );

    return contextMenuHandler;
};
