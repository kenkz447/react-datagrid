import * as React from 'react';
import { Cell, ContextMenuItem, UseDatagridCoreReturn, Selection } from '../../core';
import { readClipboard } from '../utils/clipboard';
import { UseSelectionReturn } from '../../core/hooks/useSelection';


export interface ContextMenuOptions {
    cut: () => void;
    copy: () => void;
    applyPasteDataToDatasheet: (data: string[][]) => void;
    duplicateRows: (fromRow: number, toRow?: number) => void;
    deleteRows: (fromRow: number, toRow?: number) => void;
    insertRowAfter: (rowIndex: number) => void;
    close: (event?: React.MouseEvent | null) => void;
}

// Pure function to create copy/cut/paste items
export const createCopyPasteItems = (
    activeCellRef: React.RefObject<Cell>,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const activeCell = activeCellRef.current;

    if (activeCell?.row === undefined) {
        return [];
    }

    const { copy, cut, applyPasteDataToDatasheet, close } = options;

    return [
        {
            type: 'COPY',
            action: (): void => {
                copy();
                close(null);
            },
        },
        {
            type: 'CUT',
            action: (): void => {
                cut();
                close(null);
            },
        },
        {
            type: 'PASTE',
            action: async (): Promise<void> => {
                try {
                    const pasteData = await readClipboard();
                    applyPasteDataToDatasheet(pasteData);
                } catch (error) {
                    alert('This action is unavailable in your browser, but you can still use Ctrl+V for paste');
                }
                close(null);
            },
        }
    ];
};

// Pure function to create insert row items
export const createInsertRowItems = (
    activeCellRef: React.RefObject<Cell>,
    selectionRangeRef: React.RefObject<UseSelectionReturn['range']>,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const { insertRowAfter, close } = options;
    const items: ContextMenuItem[] = [];

    const activeCell = activeCellRef.current;
    const selectionRange = selectionRangeRef.current;

    if (selectionRange?.max.row !== undefined) {
        items.push({
            type: 'INSERT_ROW_BELLOW',
            action: () => {
                close(null);
                insertRowAfter(selectionRange.max.row!);
            },
        });
    } else if (activeCell?.row !== undefined) {
        items.push({
            type: 'INSERT_ROW_BELLOW',
            action: () => {
                close(null);
                insertRowAfter(activeCell.row!);
            },
        });
    }

    return items;
};

// Pure function to create duplicate row items
export const createDuplicateRowItems = (
    activeCellRef: React.RefObject<Cell>,
    selectionRangeRef: React.RefObject<UseSelectionReturn['range']>,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const { duplicateRows, close } = options;
    const items: ContextMenuItem[] = [];

    const activeCell = activeCellRef.current;
    const selectionRange = selectionRangeRef.current;

    if (
        selectionRange?.min.row !== undefined &&
        selectionRange?.max.row !== undefined &&
        selectionRange?.min.row !== selectionRange?.max.row
    ) {
        items.push({
            type: 'DUPLICATE_ROWS',
            fromRow: selectionRange.min.row + 1,
            toRow: selectionRange.max.row + 1,
            action: () => {
                close(null);
                duplicateRows(selectionRange.min.row!, selectionRange.max.row);
            },
        });
    } else if (activeCell?.row !== undefined) {
        items.push({
            type: 'DUPLICATE_ROW',
            action: () => {
                close(null);
                duplicateRows(activeCell.row!);
            },
        });
    }

    return items;
};

// Pure function to create delete row items
export const createDeleteRowItems = (
    activeCellRef: React.RefObject<Cell>,
    selectionRangeRef: React.RefObject<UseSelectionReturn['range']>,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const { deleteRows, close } = options;
    const items: ContextMenuItem[] = [];

    const activeCell = activeCellRef.current;
    const selectionRange = selectionRangeRef.current;

    if (
        selectionRange?.min.row !== undefined &&
        selectionRange?.max.row !== undefined &&
        selectionRange?.min.row !== selectionRange.max.row
    ) {
        items.push({
            type: 'DELETE_ROWS',
            fromRow: selectionRange.min.row + 1,
            toRow: selectionRange.max.row + 1,
            action: () => {
                close(null);
                deleteRows(selectionRange.min.row!, selectionRange.max.row);
            },
        });
    } else if (activeCell?.row !== undefined) {
        items.push({
            type: 'DELETE_ROW',
            action: () => {
                close(null);
                deleteRows(activeCell.row!);
            },
        });
    }

    return items;
};

interface UseContextMenuItemsProps {
    cut: () => void;
    copy: () => void;
    close: (event?: React.MouseEvent | null) => void;
}

// Main hook that uses the pure functions
export const useContextMenuItems = (coreContext: UseDatagridCoreReturn, props: UseContextMenuItemsProps) => {

    const { activeCell, selection, applyPasteDataToDatasheet, duplicateRows, deleteRows, insertRowAfter } = coreContext;
    const { cut, copy, close } = props;

    const options: ContextMenuOptions = React.useMemo(() => ({
        cut,
        copy,
        applyPasteDataToDatasheet,
        duplicateRows,
        deleteRows,
        insertRowAfter,
        close
    }), [applyPasteDataToDatasheet, close, copy, cut, deleteRows, duplicateRows, insertRowAfter]);

    const [contextMenuItems, setContextMenuItems] = React.useState<ContextMenuItem[]>([]);

    const selectionRangeRef = React.useRef<Selection>(selection.range);
    selectionRangeRef.current = selection.range;

    const activeCellRef = React.useRef<Cell>(activeCell);
    activeCellRef.current = activeCell;

    React.useEffect(() => {
        const copyPasteItems = createCopyPasteItems(activeCellRef, options);
        const insertRowItems = createInsertRowItems(activeCellRef, selectionRangeRef, options);
        const duplicateRowItems = createDuplicateRowItems(activeCellRef, selectionRangeRef, options);
        const deleteRowItems = createDeleteRowItems(activeCellRef, selectionRangeRef, options);

        const items: ContextMenuItem[] = [
            ...copyPasteItems,
            ...insertRowItems,
            ...duplicateRowItems,
            ...deleteRowItems
        ];

        setContextMenuItems(items);

        if (!items.length) {
            close(null);
        }
    }, [
        options,
        close
    ]);

    return contextMenuItems;
};
