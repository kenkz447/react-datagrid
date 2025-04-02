import { useContext } from 'react';
import { DatagridContext, DatagridContextType } from '../contexts';
import { RowData } from '../types';

export const useDatagridContext = <TRow extends RowData>() => {
    const context = useContext<DatagridContextType<TRow>>(DatagridContext);

    if(!context) {
        throw new Error('useDatagridContext must be used within a DatagridContext.Provider');
    }

    return context;
};
