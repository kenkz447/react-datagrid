import { useCallback } from 'react';
import { UseDatagridCoreReturn } from '../../core';

type UseCutHandlerProps = Pick<UseDatagridCoreReturn, 'activeCell' | 'editing' | 'deleteSelection'> & {
    readonly onCopy: (e: ClipboardEvent) => void;
};

export const useCutHandler = ({ 
    activeCell,
    editing,
    deleteSelection,
    onCopy 
}: UseCutHandlerProps) => {
    const onCut = useCallback(
        (event?: ClipboardEvent) => {
            if (!editing && activeCell) {
                onCopy(event);
                deleteSelection(false);
            }
        },
        [activeCell, deleteSelection, editing, onCopy]
    );

    return onCut;
};
