import { useCallback } from 'react';
import { useDatagridContext, UseDatagridCoreReturn } from '../../../core';


export const useContextMenuHandler = () => {

    const {
        innerRef,
        getCursorIndex,
        activeCell,
        editing
    } = useDatagridContext();

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
