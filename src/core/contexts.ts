import React, { createContext } from 'react';
import { Cell, Column, DataSheetGridProps, RowData, UseRowControllerReturn, ScrollBehavior } from './types';

type SelectionMode = {
    columns: boolean;
    rows: boolean;
    active: boolean;
}

export interface DatagridContextType<TRow extends RowData = RowData> extends UseRowControllerReturn<TRow> {
    readonly propsRef: React.RefObject<DataSheetGridProps<TRow>>;
    readonly dataRef: React.RefObject<TRow[]>;
    readonly data: TRow[];

    readonly columns: Column<TRow, any, any>[];
    readonly hasStickyRightColumn: boolean;
    readonly selection: { min: Cell; max: Cell } | null;
    readonly isCellDisabled: (cell: Cell) => boolean;
    readonly expandSelection: number | null;

    readonly activeCell: Cell | null;
    readonly setActiveCell: React.Dispatch<React.SetStateAction<Cell & ScrollBehavior | null>>;
    readonly selectionCell: Cell | null;
    readonly setSelectionCell: React.Dispatch<React.SetStateAction<Cell & ScrollBehavior | null>>;
    readonly editing: boolean;
    readonly setEditing: React.Dispatch<React.SetStateAction<boolean>>;
    readonly selectionMode: SelectionMode;
    readonly setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>;
    readonly expandingSelectionFromRowIndex: number | null;
    readonly setExpandingSelectionFromRowIndex: React.Dispatch<React.SetStateAction<number | null>>;
    readonly expandSelectionRowsCount: number;
    readonly setExpandSelectionRowsCount: React.Dispatch<React.SetStateAction<number>>;
}

export const DatagridContext = createContext<DatagridContextType>(null!);
