import { useCallback } from 'react';
import { Cell, RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';
import { useDocumentEventListener } from '../useDocumentEventListener';

export const useContextMenuHandler = <TRow extends RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const {
        innerRef,
        contextMenu,
        getCursorIndex,
        activeCell,
        editing,
        setContextMenu,
        closeContextMenu,
        disableContextMenu
    } = datagrid;

    const tryPreventContextMenu = useCallback((event: MouseEvent) => {
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

        event.preventDefault();
    }, [innerRef, getCursorIndex, activeCell, editing, disableContextMenu]);

    const tryOpenContextMenu = useCallback(
        (event: MouseEvent) => {
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

            event.preventDefault();
        },
        [closeContextMenu, contextMenu, getCursorIndex, innerRef, setContextMenu]
    );

    useDocumentEventListener('contextmenu', tryPreventContextMenu);
    useDocumentEventListener('mousedown', tryOpenContextMenu);
};
