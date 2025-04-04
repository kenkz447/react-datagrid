import { useCallback } from 'react';
import { Cell, UseDatagridCoreReturn } from '../../core';

interface UseDatagridCursorProps {
    columnRights: number[] | null;
    columnWidths: number[] | null;
    getInnerBoundingClientRect: (force?: boolean) => DOMRect | null;
    getOuterBoundingClientRect: (force?: boolean) => DOMRect | null;
}

export const useDatagridCursor = (coreContext: UseDatagridCoreReturn, {
    columnRights,
    columnWidths,
    getInnerBoundingClientRect,
    getOuterBoundingClientRect,
}: UseDatagridCursorProps) => {
    const {
        data,
        headerRowHeight,
        hasStickyRightColumn,
        getRowIndex,
    } = coreContext;

    const dataLength = data.length;

    return useCallback(
        (event: MouseEvent, force: boolean = false, includeSticky: boolean = false): Cell | null => {
            const innerBoundingClientRect = getInnerBoundingClientRect(force);
            const outerBoundingClientRect = includeSticky && getOuterBoundingClientRect(force);

            if (innerBoundingClientRect && columnRights && columnWidths) {
                let x = event.clientX - innerBoundingClientRect.left;
                let y = event.clientY - innerBoundingClientRect.top;

                if (outerBoundingClientRect) {
                    if (
                        event.clientY - outerBoundingClientRect.top <=
                        headerRowHeight
                    ) {
                        y = 0;
                    }

                    if (
                        event.clientX - outerBoundingClientRect.left <=
                        columnWidths[0]
                    ) {
                        x = 0;
                    }

                    if (
                        hasStickyRightColumn &&
                        outerBoundingClientRect.right - event.clientX <=
                        columnWidths[columnWidths.length - 1]
                    ) {
                        x = columnRights[columnRights.length - 2] + 1;
                    }
                }

                return {
                    col: columnRights.findIndex((right) => x < right) - 1,
                    row: getRowIndex(y - headerRowHeight),
                };
            }

            return null;
        },
        [
            columnRights,
            columnWidths,
            getInnerBoundingClientRect,
            getOuterBoundingClientRect,
            headerRowHeight,
            hasStickyRightColumn,
            getRowIndex,
            dataLength,
        ]
    );
};
