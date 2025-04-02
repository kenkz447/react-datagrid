import { useCallback, useRef, useState } from 'react';
import { Cell, ContextMenuItem, RowData } from '../types';
interface UseContextMenuOptions<TRow extends RowData> {
    disableContextMenu,
    lockRows,
}

export const useContextMenu = <TRow extends RowData>(props: UseContextMenuOptions<TRow>) => {
    const {
        disableContextMenu: disableContextMenuRaw,
        lockRows,
    } = props;

    // x,y coordinates of the right click
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cursorIndex: Cell } | null>(null);

    const disableContextMenu = disableContextMenuRaw || lockRows;

    // Items of the context menu
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
    const contextMenuItemsRef = useRef(contextMenuItems);
    contextMenuItemsRef.current = contextMenuItems;
    const getContextMenuItems = useCallback(() => contextMenuItemsRef.current, []);

    return {
        contextMenu,
        setContextMenu,
        disableContextMenu,
        contextMenuItems,
        setContextMenuItems,
        getContextMenuItems
    };
};
