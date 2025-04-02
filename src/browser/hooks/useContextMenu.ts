import { useCallback, useRef, useState } from 'react';
import { Cell, ContextMenuItem, RowData, useDatagridContext } from '../../core';

export const useContextMenu = <TRow extends RowData>() => {
    const { propsRef } = useDatagridContext<TRow>();

    // x,y coordinates of the right click
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cursorIndex: Cell } | null>(null);

    const disableContextMenu = propsRef?.current.disableContextMenu || propsRef?.current.lockRows;

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
