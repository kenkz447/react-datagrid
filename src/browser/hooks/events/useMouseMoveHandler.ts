import { useCallback } from 'react';
import { useDatagridContext } from '../../../core';

interface UseMouseMoveHandlerProps {
    scrollTo,
    getCursorIndex,
}

export const useMouseMoveHandler = ({
    scrollTo,
    getCursorIndex,
}: UseMouseMoveHandlerProps) => {
    const {
        columns,
        data,
        hasStickyRightColumn,
        setEditing,
        setSelectionCell,
        expandingSelectionFromRowIndex,
        setExpandSelectionRowsCount,
        selectionMode
    } = useDatagridContext();

    const onMouseMove = useCallback(
        (event: MouseEvent) => {
            if (expandingSelectionFromRowIndex !== null) {
                const cursorIndex = getCursorIndex(event);

                if (cursorIndex) {
                    setExpandSelectionRowsCount(
                        Math.max(0, cursorIndex.row - expandingSelectionFromRowIndex)
                    );

                    scrollTo({
                        col: cursorIndex.col,
                        row: Math.max(cursorIndex.row, expandingSelectionFromRowIndex),
                    });
                }
            }

            if (selectionMode.active) {
                const cursorIndex = getCursorIndex(event);

                const lastColumnIndex =
                    columns.length - (hasStickyRightColumn ? 3 : 2);

                setSelectionCell(
                    cursorIndex && {
                        col: selectionMode.columns
                            ? Math.max(0, Math.min(lastColumnIndex, cursorIndex.col))
                            : lastColumnIndex,
                        row: selectionMode.rows
                            ? Math.max(0, cursorIndex.row)
                            : data.length - 1,
                        doNotScrollX: !selectionMode.columns,
                        doNotScrollY: !selectionMode.rows,
                    }
                );
                setEditing(false);
            }
        },
        [
            scrollTo,
            selectionMode.active,
            selectionMode.columns,
            selectionMode.rows,
            getCursorIndex,
            columns.length,
            hasStickyRightColumn,
            setSelectionCell,
            data.length,
            expandingSelectionFromRowIndex,
        ]
    );

    return onMouseMove;
};
