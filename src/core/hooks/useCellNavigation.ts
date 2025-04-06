import React, { useRef } from 'react';
import { Cell, Column, ScrollBehavior, Selection } from '../types';


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
    selection: Selection;
    selectionCell: Cell | null;
    activeCell: Cell | null;
    hasStickyRightColumn: boolean;
    setEditing: (editing: boolean) => void;
    setActiveCell: React.Dispatch<React.SetStateAction<Cell & ScrollBehavior>>;
    setSelectionCell: React.Dispatch<React.SetStateAction<Cell & ScrollBehavior>>;
}

export const useCellNavigation = (props: UseCellNavigationProps) => {
    const {
        data,
        columns,
        editing,
        selection,
        selectionCell,
        activeCell,
        hasStickyRightColumn,
        setActiveCell,
        setEditing,
        setSelectionCell
    } = props;

    const refsValue = {
        data,
        columns,
        editing,
        selection,
        selectionCell,
        activeCell,
        hasStickyRightColumn,
    };

    const refs = useRef(refsValue);
    refs.current = refsValue;

    const navigation = React.useMemo(() => ({
        existFocus: () => {
            setEditing(false);
            setActiveCell(null);
            setSelectionCell(null);
        },
        goPrevRow: () => {
            setEditing(false);
            setActiveCell((cell) => ({
                col: refs.current.columns.length - (hasStickyRightColumn ? 3 : 2),
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
        }
    }), [hasStickyRightColumn, setActiveCell, setEditing, setSelectionCell]);

    return navigation;
};
