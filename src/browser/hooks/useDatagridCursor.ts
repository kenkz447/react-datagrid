import { useCallback } from 'react';
import { Cell } from '../../core';

interface UseDatagridCursorProps {
    columnRights: number[] | null;
    columnWidths: number[] | null;
    getInnerBoundingClientRect: (force?: boolean) => DOMRect | null;
    getOuterBoundingClientRect: (force?: boolean) => DOMRect | null;
    headerRowHeight: number;
    hasStickyRightColumn: boolean;
    getRowIndex: (y: number) => number;
    dataLength: number;
}

export const useDatagridCursor = ({
    columnRights,
    columnWidths,
    getInnerBoundingClientRect,
    getOuterBoundingClientRect,
    headerRowHeight,
    hasStickyRightColumn,
    getRowIndex,
    dataLength,
}: UseDatagridCursorProps) => {
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
