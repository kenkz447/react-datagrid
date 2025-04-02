import { useEffect, useRef } from 'react';
import { getCellWithId, getSelectionWithId, useDatagridContext } from '../../core';

interface UseCallbacksProps {
    lastEditingCellRef
}

export const useCallbacks = ({
    lastEditingCellRef
}: UseCallbacksProps) => {
    const {
        propsRef,
        activeCell,
        columns,
        editing,
        selection,
    } = useDatagridContext();

    const {
        onFocus,
        onBlur,
        onActiveCellChange,
        onSelectionChange,
    } = propsRef.current;

    const callbacksRef = useRef({
        onFocus,
        onBlur,
        onActiveCellChange,
        onSelectionChange,
    });
    callbacksRef.current.onFocus = onFocus;
    callbacksRef.current.onBlur = onBlur;
    callbacksRef.current.onActiveCellChange = onActiveCellChange;
    callbacksRef.current.onSelectionChange = onSelectionChange;

    useEffect(() => {
        if (lastEditingCellRef.current) {
            if (editing) {
                callbacksRef.current.onFocus?.({
                    cell: getCellWithId(lastEditingCellRef.current, columns),
                });
            } else {
                callbacksRef.current.onBlur?.({
                    cell: getCellWithId(lastEditingCellRef.current, columns),
                });
            }
        }
    }, [editing, columns]);

    useEffect(() => {
        callbacksRef.current.onActiveCellChange?.({
            cell: getCellWithId(activeCell, columns),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCell?.col, activeCell?.row, columns]);

    useEffect(() => {
        callbacksRef.current.onSelectionChange?.({
            selection: getSelectionWithId(
                selection ??
                (activeCell ? { min: activeCell, max: activeCell } : null),
                columns
            ),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.min.col ?? activeCell?.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.min.row ?? activeCell?.row,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.max.col ?? activeCell?.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.max.row ?? activeCell?.row,
        activeCell?.col,
        activeCell?.row,
        columns,
    ]);
};
