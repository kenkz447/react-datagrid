import { useCallback } from 'react';
import { useDatagridContext } from '../../../core';

interface UseCutHandlerProps {
    readonly onCopy: (e: ClipboardEvent) => void;
};

export const useCutHandler = ({ onCopy }: UseCutHandlerProps) => {
    const {
        activeCell,
        editing,
        deleteSelection,
    } = useDatagridContext();

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
