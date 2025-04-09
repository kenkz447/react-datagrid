import { useRef } from 'react';
import { CellCoordinates, RowData, ScrollBehavior, UseDatagridCoreReturn } from '../../core';

const BORDER_WIDTH = 1;

interface UseDatagridScrollProps {
    height: number | undefined;
    width: number | undefined;
    columnRights: number[] | null;
    columnWidths: number[] | null;
    outerRef: React.RefObject<HTMLElement>;
}

export const useDatagridScroll = <TRow extends RowData = RowData>(coreContext: UseDatagridCoreReturn<TRow>, props: UseDatagridScrollProps) => {

    const refsValues = { ...coreContext, ...props };
    const refs = useRef(refsValues);


    const scrollTo = useRef((cell: CellCoordinates & ScrollBehavior) => {
        const { height, width, columnRights, columnWidths, outerRef, hasStickyRightColumn, headerRowHeight, getRowSize } = refs.current;

        if (!height || !width || cell.doNotScrollY) {
            return;
        }

        // Align top
        const rowSize = getRowSize(cell.row);
        const topMax = rowSize.top;
        // Align bottom
        const topMin = rowSize.top + rowSize.height + headerRowHeight - height + BORDER_WIDTH;

        const scrollTop = outerRef.current!.scrollTop;

        if (scrollTop > topMax) {
            outerRef.current!.scrollTop = topMax;
        } else if (scrollTop < topMin) {
            outerRef.current!.scrollTop = topMin;
        }

        if (columnRights && columnWidths && outerRef.current) {
            // Align left
            const leftMax = columnRights[cell.col] - columnRights[0];
            // Align right
            const leftMin =
                columnRights[cell.col] +
                columnWidths[cell.col + 1] +
                (hasStickyRightColumn
                    ? columnWidths[columnWidths.length - 1]
                    : 0) -
                width +
                BORDER_WIDTH;

            const scrollLeft = outerRef.current.scrollLeft;

            if (scrollLeft > leftMax) {
                outerRef.current.scrollLeft = leftMax;
            } else if (scrollLeft < leftMin) {
                outerRef.current.scrollLeft = leftMin;
            }
        }
    });

    return scrollTo.current;
};
