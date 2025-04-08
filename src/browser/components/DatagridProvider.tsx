import { PropsWithChildren } from 'react';
import { DatagridContext } from '../contexts';
import { useWhatChanged, RowData } from '../../core';

import { UseDatagridReturn } from '../hooks/useDatagrid';
import { useMouseDownHandler } from '../hooks/events/useMouseDownHandler';
import { useMouseUpHandler } from '../hooks/events/useMouseUpHandler';
import { useMouseMoveHandler } from '../hooks/events/useMouseMoveHandler';
import { useKeydownHandler } from '../hooks/events/useKeydownHandler';
import { useContextMenuHandler } from '../hooks/events/useContextMenuHandler';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { useDragSelectHandler } from '../hooks/events/useDragSelectHandler';

export function DatagridProvider<TRow extends RowData>({ children, ...datagrid }: PropsWithChildren<UseDatagridReturn<TRow>>) {
    useMouseDownHandler(datagrid);
    useMouseUpHandler(datagrid);
    useMouseMoveHandler(datagrid);

    useKeydownHandler(datagrid);
    useContextMenuHandler(datagrid);
    useDragSelectHandler(datagrid);

    useDocumentEventListener('paste', datagrid.paste);
    useDocumentEventListener('copy', datagrid.copy);
    useDocumentEventListener('cut', datagrid.cut);

    useWhatChanged(datagrid);

    return (
        <DatagridContext.Provider value={datagrid}>
            {children}
        </DatagridContext.Provider>
    );
};
