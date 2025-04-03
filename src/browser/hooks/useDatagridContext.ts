import { useContext } from 'react';
import { DatagridContext } from '../contexts';
import { RowData } from '../../core/types';
import { UseDatagridReturn } from './useDatagrid';

export const useDatagridContext = <TRow extends RowData>() => {
    const context = useContext<UseDatagridReturn<TRow>>(DatagridContext);

    if(!context) {
        throw new Error('useDatagridContext must be used within a DatagridContext.Provider');
    }

    return context;
};
