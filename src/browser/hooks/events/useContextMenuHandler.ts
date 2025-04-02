import { useCallback } from 'react';

interface UseContextMenuHandlerProps {
    innerRef,
    getCursorIndex,
    activeCell,
    editing,
}

export const useContextMenuHandler = (props: UseContextMenuHandlerProps) => {
    const {
        innerRef,
        getCursorIndex,
        activeCell,
        editing,
    } = props;

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
