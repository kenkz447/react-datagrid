import { useCallback } from 'react';

interface UseCutHandlerProps {
    activeCell,
    editing,
    deleteSelection,
    onCopy,
};

export const useCutHandler = (props: UseCutHandlerProps) => {
    const {
        activeCell,
        editing,
        deleteSelection,
        onCopy,
    } = props;

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
