import * as React from 'react';
import { ContextMenuItem, UseDatagridCoreReturn } from '../../core';
import { readClipboard } from '../utils/clipboard';

// Types for hook parameters
export interface CellPosition {
    row?: number;
    col?: number;
}

export interface Selection {
    min: CellPosition;
    max: CellPosition;
}

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
    activeCell: CellPosition | null,
    options: ContextMenuOptions
): ContextMenuItem[] => {
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
    activeCell: CellPosition | null,
    selection: Selection | null,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const { insertRowAfter, close } = options;
    const items: ContextMenuItem[] = [];

    if (selection?.max.row !== undefined) {
        items.push({
            type: 'INSERT_ROW_BELLOW',
            action: () => {
                close(null);
                insertRowAfter(selection.max.row!);
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
    activeCell: CellPosition | null,
    selection: Selection | null,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const { duplicateRows, close } = options;
    const items: ContextMenuItem[] = [];

    if (
        selection?.min.row !== undefined &&
        selection.max.row !== undefined &&
        selection.min.row !== selection.max.row
    ) {
        items.push({
            type: 'DUPLICATE_ROWS',
            fromRow: selection.min.row + 1,
            toRow: selection.max.row + 1,
            action: () => {
                close(null);
                duplicateRows(selection.min.row!, selection.max.row);
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
    activeCell: CellPosition | null,
    selection: Selection | null,
    options: ContextMenuOptions
): ContextMenuItem[] => {
    const { deleteRows, close } = options;
    const items: ContextMenuItem[] = [];

    if (
        selection?.min.row !== undefined &&
        selection.max.row !== undefined &&
        selection.min.row !== selection.max.row
    ) {
        items.push({
            type: 'DELETE_ROWS',
            fromRow: selection.min.row + 1,
            toRow: selection.max.row + 1,
            action: () => {
                close(null);
                deleteRows(selection.min.row!, selection.max.row);
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

    React.useEffect(() => {
        const copyPasteItems = createCopyPasteItems(activeCell, options);
        const insertRowItems = createInsertRowItems(activeCell, selection, options);
        const duplicateRowItems = createDuplicateRowItems(activeCell, selection, options);
        const deleteRowItems = createDeleteRowItems(activeCell, selection, options);

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
        selection,
        activeCell,
        options,
        close
    ]);

    return contextMenuItems;
};
