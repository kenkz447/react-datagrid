import { useCallback } from 'react';
import { RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';

export const useMouseMoveHandler = <TRow extends RowData = RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const {
        columns,
        data,
        hasStickyRightColumn,
        expandingSelectionFromRowIndex,
        selection,
        setEditing,
        setExpandSelectionRowsCount,
        getCursorIndex,
        scrollTo
    } = datagrid;

    const {
        dragging,
        setSelectionCell,
    } = selection;

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

            if (dragging.active) {
                const cursorIndex = getCursorIndex(event);

                const lastColumnIndex =
                    columns.length - (hasStickyRightColumn ? 3 : 2);

                setSelectionCell(
                    cursorIndex && {
                        col: dragging.columns
                            ? Math.max(0, Math.min(lastColumnIndex, cursorIndex.col))
                            : lastColumnIndex,
                        row: dragging.rows
                            ? Math.max(0, cursorIndex.row)
                            : data.length - 1,
                        doNotScrollX: !dragging.columns,
                        doNotScrollY: !dragging.rows,
                    }
                );
                setEditing(false);
            }
        },
        [expandingSelectionFromRowIndex, dragging.active, dragging.columns, dragging.rows, getCursorIndex, setExpandSelectionRowsCount, scrollTo, columns.length, hasStickyRightColumn, setSelectionCell, data.length, setEditing]
    );

    return onMouseMove;
};
