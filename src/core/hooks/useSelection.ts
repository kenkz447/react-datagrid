import React, { useMemo, useRef } from 'react';
import { Cell, Column, ScrollBehavior, Selection, SelectionMode } from '../types';
import { useDeepEqualState } from './internal/useDeepEqualState';


const add = ({
    columnLength,
    maxRow,
    hasStickyRightColumn,
    offset,
    cell
}: { columnLength: number, maxRow: number, hasStickyRightColumn: boolean, offset: [number, number], cell: Cell | null }): Cell | null => {
    // Return null if cell is null
    if (!cell) return null;

    const [deltaX, deltaY] = offset;

    // Calculate column boundaries
    const minCol = 0;
    const maxCol = columnLength - (hasStickyRightColumn ? 3 : 2);

    // Calculate row boundaries
    const minRow = 0;

    // Create new cell with position clamped within boundaries
    return {
        col: Math.max(minCol, Math.min(maxCol, cell.col + deltaX)),
        row: Math.max(minRow, Math.min(maxRow, cell.row + deltaY)),
    };
};

interface UseCellNavigationProps {
    data: unknown[];
    columns: Column<any, any, any>[];
    editing: boolean;
    activeCell: Cell | null;
    hasStickyRightColumn: boolean;
    setEditing: (editing: boolean) => void;
    setActiveCell: React.Dispatch<React.SetStateAction<Cell & ScrollBehavior>>;
}

export type UseSelectionReturn = ReturnType<typeof useSelection>;

export const useSelection = (props: UseCellNavigationProps) => {
    const {
        data,
        columns,
        editing,
        activeCell,
        hasStickyRightColumn,
        setActiveCell,
        setEditing,
    } = props;

    const refsValue = {
        data,
        columns,
        editing,
        activeCell,
        hasStickyRightColumn,
    };

    const refs = useRef(refsValue);
    refs.current = refsValue;

    // The selection cell and the active cell are the two corners of the selection, null when nothing is selected
    const [selectionCell, setSelectionCell] = useDeepEqualState<(Cell & ScrollBehavior) | null>(null);

    // Min and max of the current selection (rectangle defined by the active cell and the selection cell), null when nothing is selected
    const range = useMemo<Selection | null>(
        () =>
            activeCell &&
            selectionCell && {
                min: {
                    col: Math.min(activeCell.col, selectionCell.col),
                    row: Math.min(activeCell.row, selectionCell.row),
                },
                max: {
                    col: Math.max(activeCell.col, selectionCell.col),
                    row: Math.max(activeCell.row, selectionCell.row),
                },
            },
        [activeCell, selectionCell]
    );

    // Behavior of the selection when the user drags the mouse around
    const [dragging, setDragging] = useDeepEqualState<SelectionMode>({
        // True when the position of the cursor should impact the columns of the selection
        columns: false,
        // True when the position of the cursor should impact the rows of the selection
        rows: false,
        // True when the user is dragging the mouse around to select
        active: false,
    });

    const navigation = useRef({
        existFocus: () => {
            setEditing(false);
            setActiveCell(null);
            setSelectionCell(null);
        },
        goPrevRow: () => {
            setEditing(false);
            setActiveCell((cell) => ({
                col: refs.current.columns.length - (refs.current.hasStickyRightColumn ? 3 : 2),
                row: (cell?.row ?? 1) - 1,
            }));
            setSelectionCell(null);
        },
        goNextRow: () => {
            setEditing(false);
            setActiveCell((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }));
            setSelectionCell(null);
        },
        goRight: () => {
            setEditing(false);
            const direction: [number, number] = [1, 0];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
        },
        goLeft: () => {
            setEditing(false);
            const direction: [number, number] = [-1, 0];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);

            setSelectionCell(null);
        },
        goUp: () => {
            setEditing(false);
            const direction: [number, number] = [0, -1];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
        },
        goDown: () => {
            setEditing(false);
            const direction: [number, number] = [0, 1];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
        },
        jumpRight: () => {
            const direction: [number, number] = [refs.current.columns.length, 0];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
            setEditing(false);
        },
        jumpLeft: () => {
            const direction: [number, number] = [-refs.current.columns.length, 0];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
            setEditing(false);
        },
        jumpUp: () => {
            const direction: [number, number] = [0, -refs.current.data.length];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
            setEditing(false);
        },
        jumpDown: () => {
            const direction: [number, number] = [0, refs.current.data.length];
            setActiveCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell
            }));
            setSelectionCell(null);
            setEditing(false);
        },
        selectLeft: () => {
            const direction: [number, number] = [-1, 0];
            setSelectionCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell: cell || refs.current.activeCell
            }));
        },
        selectRight: () => {
            const direction: [number, number] = [1, 0];
            setSelectionCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell: cell || refs.current.activeCell
            }));
        },
        selectUp: () => {
            const direction: [number, number] = [0, -1];
            setSelectionCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell: cell || refs.current.activeCell
            }));
        },
        selectDown: () => {
            const direction: [number, number] = [0, 1];
            setSelectionCell((cell) => add({
                columnLength: refs.current.columns.length,
                maxRow: refs.current.data.length - 1,
                hasStickyRightColumn: refs.current.hasStickyRightColumn,
                offset: direction,
                cell: cell || refs.current.activeCell
            }));
        },
        selectAll: () => {
            setEditing(false);
            setActiveCell({
                col: 0,
                row: 0,
                doNotScrollY: true,
                doNotScrollX: true,
            });
            setSelectionCell({
                col: refs.current.columns.length - (refs.current.hasStickyRightColumn ? 3 : 2),
                row: refs.current.data.length - 1,
                doNotScrollY: true,
                doNotScrollX: true,
            });
        },
        startDragging: (dragSelect: Omit<SelectionMode, 'active'>) => {
            setDragging({
                ...dragSelect,
                active: true,
            });
        },
        stopDragging: () => {
            setDragging({
                columns: false,
                rows: false,
                active: false,
            });
        }
    });

    return {
        ...navigation.current,
        range,
        dragging,
        cell: selectionCell,
        setSelectionCell
    };
};
