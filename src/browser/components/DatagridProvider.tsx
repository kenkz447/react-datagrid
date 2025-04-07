import React, { PropsWithChildren } from 'react';
import { DatagridContext } from '../contexts';
import { Cell, Column, ContextMenuItem, DataSheetGridProps, RowData, RowSize, ScrollBehavior, Selection, SelectionMode } from '../../core/types';
import { UseDatagridReturn } from '../hooks/useDatagrid';
import { useMouseDownHandler } from '../hooks/events/useMouseDownHandler';
import { useMouseUpHandler } from '../hooks/events/useMouseUpHandler';
import { useMouseMoveHandler } from '../hooks/events/useMouseMoveHandler';
import { useKeydownHandler } from '../hooks/events/useKeydownHandler';
import { useContextMenuHandler } from '../hooks/events/useContextMenuHandler';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { useDragSelectHandler } from '../hooks/events/useDragSelectHandler';
import { useWhatChanged } from '../../core';

export function DatagridProvider<TRow extends RowData>({ children, ...datagrid }: PropsWithChildren<UseDatagridReturn<TRow>>) {
    const onMouseDown = useMouseDownHandler(datagrid);
    const onMouseUp = useMouseUpHandler(datagrid);
    // const onMouseMove = useMouseMoveHandler(datagrid);

    // useKeydownHandler(datagrid);
    // useContextMenuHandler(datagrid);
    // useDragSelectHandler(datagrid);

    useDocumentEventListener('paste', datagrid.paste);
    useDocumentEventListener('copy', datagrid.copy);
    useDocumentEventListener('cut', datagrid.cut);
    useDocumentEventListener('mouseup', onMouseUp);
    useDocumentEventListener('mousedown', onMouseDown);

    // useDocumentEventListener('mousemove', onMouseMove);


    useWhatChanged(datagrid);

    return (
        <DatagridContext.Provider value={datagrid}>
            {children}
        </DatagridContext.Provider>
    );
};
