import { useCallback, useRef } from 'react';
import { RowData, UseDatagridCoreReturn } from '../../core';

type UseCutHandlerProps = {
    readonly copy: (e: ClipboardEvent) => void;
};

export const useCutHandler = <TRow extends RowData = RowData>(
    coreContext: UseDatagridCoreReturn<TRow>,
    { copy }: UseCutHandlerProps
) => {
    const { activeCell, editing, deleteSelection } = coreContext;

    const activeCellRef = useRef(activeCell);
    activeCellRef.current = activeCell;

    const onCut = useCallback(
        (event?: ClipboardEvent) => {
            if (!editing && activeCellRef.current) {
                copy(event);
                deleteSelection(false);
            }
        },
        [deleteSelection, editing, copy]
    );

    return onCut;
};
