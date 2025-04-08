import { useRef } from 'react';
import { RowData } from '../../../core';
import { UseDatagridReturn } from '../useDatagrid';
import { useDocumentEventListener } from '../useDocumentEventListener';

export const useMouseMoveHandler = <TRow extends RowData = RowData>(datagrid: UseDatagridReturn<TRow>) => {
    const refs = useRef(datagrid);
    refs.current = datagrid;

    const onMouseMove = useRef((event: MouseEvent) => {
        const {
            expandingSelectionFromRowIndex,
            setExpandSelectionRowsCount,
            getCursorIndex,
            scrollTo
        } = refs.current;

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
    });

    useDocumentEventListener('mousemove', onMouseMove.current);
};
