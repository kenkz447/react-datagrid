import React, { PropsWithChildren } from 'react';
import { DatagridContext } from '../contexts';
import { RowData } from '../../core/types';
import { UseDatagridReturn } from '../hooks/useDatagrid';

export function DatagridProvider<TRow extends RowData>({children, ...props}: PropsWithChildren<UseDatagridReturn<TRow>>) {
    return (
        <DatagridContext.Provider value={props}>
            {children}
        </DatagridContext.Provider>
    );
};
