import { useCallback } from 'react';
import { RowData, UseDatagridCoreReturn } from '../../core';

type UseCutHandlerProps = {
    readonly copy: (e: ClipboardEvent) => void;
};

export const useCutHandler = <TRow extends RowData = RowData>(
    coreContext: UseDatagridCoreReturn<TRow>,
    { copy }: UseCutHandlerProps
) => {
    const { activeCell, editing, deleteSelection } = coreContext;

    const onCut = useCallback(
        (event?: ClipboardEvent) => {
            if (!editing && activeCell) {
                copy(event);
                deleteSelection(false);
            }
        },
        [activeCell, deleteSelection, editing, copy]
    );

    return onCut;
};
