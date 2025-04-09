import { useRef } from 'react';
import { CellCoordinates, RowData, UseDatagridCoreReturn } from '../../core';
import { useGetBoundingClientRect } from './useGetBoundingClientRect';

interface UseDatagridCursorProps {
    outerRef: React.RefObject<HTMLElement>;
    innerRef: React.RefObject<HTMLElement>;
    columnRights: number[] | null;
    columnWidths: number[] | null;
}

export const useDatagridCursor = <TRow extends RowData = RowData>(coreContext: UseDatagridCoreReturn<TRow>, props: UseDatagridCursorProps) => {
    const {
        outerRef,
        innerRef
    } = props;
    const refsValues = {
        ...coreContext,
        ...props,
    };

    const refs = useRef(refsValues);
    refs.current = refsValues;

    const getOuterBoundingClientRect = useGetBoundingClientRect(outerRef);
    const getInnerBoundingClientRect = useGetBoundingClientRect(innerRef);

    const getCursorIndex = useRef((event: MouseEvent, force: boolean = false, includeSticky: boolean = false): CellCoordinates | null => {
        const {
            columnRights,
            columnWidths,
            headerRowHeight,
            hasStickyRightColumn,
            getRowIndex,
        } = refs.current;

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
    });

    return getCursorIndex.current;
};
