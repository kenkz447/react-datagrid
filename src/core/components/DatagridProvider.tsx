import React from 'react';
import { DatagridContext } from '../contexts';
import { useDatagrid } from '../hooks/useDatagrid';
import { Column, DataSheetGridProps, RowData } from '../types';

const DEFAULT_DATA: any[] = [];
const DEFAULT_COLUMNS: Column<any, any, any>[] = [];
const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_MAX_HEIGHT = 400;

export function DatagridProvider<TRow extends RowData>({
    children,
    data = DEFAULT_DATA,
    columns = DEFAULT_COLUMNS,
    maxHeight = DEFAULT_MAX_HEIGHT,
    rowHeight = DEFAULT_ROW_HEIGHT,
    headerRowHeight = typeof rowHeight === 'number' ? rowHeight : DEFAULT_ROW_HEIGHT,
    ...props
}: React.PropsWithChildren<DataSheetGridProps<TRow>>) {
    const context = useDatagrid<TRow>({
        data,
        columns,
        maxHeight,
        rowHeight,
        headerRowHeight,
        ...props,
    });

    return (
        <DatagridContext.Provider value={context}>
            {children}
        </DatagridContext.Provider>
    );
};
