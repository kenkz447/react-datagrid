import { useCallback, useMemo, useRef, useState } from 'react';
import { useDeepEqualState } from './internal/useDeepEqualState';
import { Cell, Selection, ScrollBehavior, SelectionMode } from '../types';

export const useCell = () => {
    // When not null, represents the index of the row from which we are expanding
    const [
        expandingSelectionFromRowIndex,
        setExpandingSelectionFromRowIndex,
    ] = useState<number | null>(null);

    // Highlighted cell, null when not focused
    const [activeCell, setActiveCell] = useDeepEqualState<(Cell & ScrollBehavior) | null>(null);

    // The selection cell and the active cell are the two corners of the selection, null when nothing is selected
    const [selectionCell, setSelectionCell] = useDeepEqualState<(Cell & ScrollBehavior) | null>(null);

    // Min and max of the current selection (rectangle defined by the active cell and the selection cell), null when nothing is selected
    const selection = useMemo<Selection | null>(
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

    const selectionRef = useRef(selection);
    selectionRef.current = selection;

    // Behavior of the selection when the user drags the mouse around
    const [selectionMode, setSelectionMode] = useDeepEqualState<SelectionMode>({
        // True when the position of the cursor should impact the columns of the selection
        columns: false,
        // True when the position of the cursor should impact the rows of the selection
        rows: false,
        // True when the user is dragging the mouse around to select
        active: false,
    });

    const startSelection = useCallback((selectionMode: Omit<SelectionMode, 'active'>) => {
        setSelectionMode({
            ...selectionMode,
            active: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const endSelection = useCallback(() => {
        setSelectionMode({
            columns: false,
            rows: false,
            active: false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        activeCell,
        setActiveCell,
        expandingSelectionFromRowIndex,
        setExpandingSelectionFromRowIndex,
        selectionCell,
        setSelectionCell,
        selection,
        selectionMode,
        startSelection,
        endSelection,
        selectionRef
    };
};
