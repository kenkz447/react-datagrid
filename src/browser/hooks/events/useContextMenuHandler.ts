import { useCallback } from 'react';
import { useDatagridContext } from '../../../core';

interface UseContextMenuHandlerProps {
    innerRef,
    getCursorIndex,
}

export const useContextMenuHandler = ({
    innerRef,
    getCursorIndex,
}: UseContextMenuHandlerProps) => {
    const {
        activeCell,
        editing,
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
