import * as React from 'react';
import { CellCoordinates, readClipboard, UseDatagridReturn } from '@basestacks/react-datagrid';

export type ContextMenuItem =
    | {
        readonly type: 'INSERT_ROW_BELLOW' | 'DELETE_ROW' | 'DUPLICATE_ROW' | 'COPY' | 'CUT' | 'PASTE'
        readonly action: () => void
    }
    | {
        readonly type: 'DELETE_ROWS' | 'DUPLICATE_ROWS'
        readonly action: () => void
        readonly fromRow: number
        readonly toRow: number
    }

// Main hook that uses the pure functions
export const useContextMenuItems = (datagrid: UseDatagridReturn) => {
    const { activeCell, selection, applyPasteDataToDatasheet, duplicateRows, deleteRows, insertRowAfter, cut, copy, closeContextMenu } = datagrid;

    const selectionRangeRef = React.useRef(selection.range);
    selectionRangeRef.current = selection.range;

    const activeCellRef = React.useRef<CellCoordinates>(activeCell);
    activeCellRef.current = activeCell;

    const [contextMenuItems] = React.useState<ContextMenuItem[]>(() => {
        const items: ContextMenuItem[] = [{
            type: 'COPY',
            action: (): void => {
                copy();
                closeContextMenu();
            },
        },
        {
            type: 'CUT',
            action: (): void => {
                cut();
                closeContextMenu();
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
                closeContextMenu();
            },
        }, {
            type: 'INSERT_ROW_BELLOW',
            action: () => {
                if (selectionRangeRef?.current.min.row !== undefined) {
                    insertRowAfter(selectionRangeRef.current.max.row!);
                }
                else if (activeCellRef.current) {
                    insertRowAfter(activeCellRef.current.row);
                }

                closeContextMenu();
            }
        }, {
            type: 'DUPLICATE_ROWS',
            fromRow: selectionRangeRef.current?.min.row + 1,
            toRow: selectionRangeRef.current?.max.row + 1,
            action: () => {
                if (!(selectionRangeRef.current?.min.row !== undefined &&
                    selectionRangeRef.current?.max.row !== undefined &&
                    selectionRangeRef.current?.min.row !== selectionRangeRef.current?.max.row)) {
                    return;
                }

                closeContextMenu();
                duplicateRows(selectionRangeRef.current.min.row!, selectionRangeRef.current.max.row);
            },
        }, {
            type: 'DUPLICATE_ROW',
            action: () => {
                if (!(
                    selectionRangeRef.current?.min.row !== undefined &&
                    selectionRangeRef.current?.max.row !== undefined &&
                    selectionRangeRef.current?.min.row !== selectionRangeRef.current?.max.row
                )) {
                    return;
                }
                closeContextMenu();
                duplicateRows(activeCellRef.current.row!);
            },
        }];

        if (
            selectionRangeRef.current?.min.row !== undefined &&
            selectionRangeRef.current?.max.row !== undefined &&
            selectionRangeRef.current?.min.row !== selectionRangeRef.current.max.row
        ) {
            items.push({
                type: 'DELETE_ROWS',
                fromRow: selectionRangeRef.current.min.row + 1,
                toRow: selectionRangeRef.current.max.row + 1,
                action: () => {
                    closeContextMenu();
                    deleteRows(selectionRangeRef.current.min.row!, selectionRangeRef.current.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DELETE_ROW',
                action: () => {
                    closeContextMenu();
                    deleteRows(activeCell.row!);
                },
            });
        }

        return items;
    });

    return contextMenuItems;
};
