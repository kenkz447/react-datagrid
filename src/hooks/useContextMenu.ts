import { useCallback, useEffect, useRef, useState } from 'react';
import { Cell, ContextMenuItem, RowData } from '../types';
import { parseTextHtmlData, parseTextPlainData } from '../utils/copyPasting';

interface UseContextMenuOptions<TRow extends RowData> {
    disableContextMenu,
    lockRows,
    activeCell,
    selection,
    deleteRows,
    duplicateRows,
    insertRowAfter,
    onCut,
    onCopy,
    applyPasteDataToDatasheet,
}

export const useContextMenu = <TRow extends RowData>(props: UseContextMenuOptions<TRow>) => {
    const {
        disableContextMenu: disableContextMenuRaw,
        lockRows,

        activeCell,
        selection,
        deleteRows,
        duplicateRows,
        insertRowAfter,
        onCut,
        onCopy,
        applyPasteDataToDatasheet,
    } = props;

    const disableContextMenu = disableContextMenuRaw || lockRows;

    // x,y coordinates of the right click
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cursorIndex: Cell } | null>(null);

    // Items of the context menu
    const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);
    const contextMenuItemsRef = useRef(contextMenuItems);
    contextMenuItemsRef.current = contextMenuItems;
    const getContextMenuItems = useCallback(() => contextMenuItemsRef.current, []);

    useEffect(() => {
        const items: ContextMenuItem[] = [];

        if (activeCell?.row !== undefined) {
            items.push(
                {
                    type: 'COPY',
                    action: (): void => {
                        onCopy();
                        setContextMenu(null);
                    },
                },
                {
                    type: 'CUT',
                    action: (): void => {
                        onCut();
                        setContextMenu(null);
                    },
                },
                {
                    type: 'PASTE',
                    action: async (): Promise<void> => {
                        if (navigator.clipboard.read !== undefined) {
                            const items = await navigator.clipboard.read();
                            items.forEach(async (item) => {
                                let pasteData = [['']];
                                if (item.types.includes('text/html')) {
                                    const htmlTextData = await item.getType('text/html');
                                    pasteData = parseTextHtmlData(await htmlTextData.text());
                                } else if (item.types.includes('text/plain')) {
                                    const plainTextData = await item.getType('text/plain');
                                    pasteData = parseTextPlainData(await plainTextData.text());
                                } else if (item.types.includes('text')) {
                                    const htmlTextData = await item.getType('text');
                                    pasteData = parseTextHtmlData(await htmlTextData.text());
                                }
                                applyPasteDataToDatasheet(pasteData);
                            });
                        } else if (navigator.clipboard.readText !== undefined) {
                            const text = await navigator.clipboard.readText();
                            applyPasteDataToDatasheet(parseTextPlainData(text));
                        } else {
                            alert(
                                'This action is unavailable in your browser, but you can still use Ctrl+V for paste'
                            );
                        }
                        setContextMenu(null);
                    },
                }
            );
        }

        if (selection?.max.row !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    setContextMenu(null);
                    insertRowAfter(selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    setContextMenu(null);
                    insertRowAfter(activeCell.row);
                },
            });
        }

        if (
            selection?.min.row !== undefined &&
            selection.min.row !== selection.max.row
        ) {
            items.push({
                type: 'DUPLICATE_ROWS',
                fromRow: selection.min.row + 1,
                toRow: selection.max.row + 1,
                action: () => {
                    setContextMenu(null);
                    duplicateRows(selection.min.row, selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DUPLICATE_ROW',
                action: () => {
                    setContextMenu(null);
                    duplicateRows(activeCell.row);
                },
            });
        }

        if (
            selection?.min.row !== undefined &&
            selection.min.row !== selection.max.row
        ) {
            items.push({
                type: 'DELETE_ROWS',
                fromRow: selection.min.row + 1,
                toRow: selection.max.row + 1,
                action: () => {
                    setContextMenu(null);
                    deleteRows(selection.min.row, selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DELETE_ROW',
                action: () => {
                    setContextMenu(null);
                    deleteRows(activeCell.row);
                },
            });
        }

        setContextMenuItems(items);
        if (!items.length) {
            setContextMenu(null);
        }
    }, [
        selection,
        activeCell,
        deleteRows,
        duplicateRows,
        insertRowAfter,
        onCut,
        onCopy,
        applyPasteDataToDatasheet,
    ]);

    return {
        disableContextMenu,
        contextMenu,
        setContextMenu,
        contextMenuItems,
        setContextMenuItems,
        getContextMenuItems
    };
};
