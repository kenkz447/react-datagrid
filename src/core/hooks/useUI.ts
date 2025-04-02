import { useCallback, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useRowHeights } from './internal/useRowHeights';
import { useDebounceState } from './internal/useDebounceState';
import { useColumnWidths } from './internal/useColumnWidths';
import { useGetBoundingClientRect } from './internal/useGetBoundingClientRect';
import { Cell, ScrollBehavior } from '../types';

interface UseUIProps {
    data,
    columns,
    rowHeight,
    headerRowHeight,
    maxHeight,
    hasStickyRightColumn
}

export const useUI = (props: UseUIProps) => {
    const {
        data,
        columns,
        rowHeight,
        headerRowHeight,
        maxHeight,
        hasStickyRightColumn
    } = props;

    const outerRef = useRef<HTMLDivElement>(null);
    
    const getOuterBoundingClientRect = useGetBoundingClientRect(outerRef);

    // Width and height of the scrollable area
    const { width, height } = useResizeDetector({
        targetRef: outerRef,
        refreshMode: 'throttle',
        refreshRate: 100,
    });

    const { getRowSize, totalSize, getRowIndex } = useRowHeights({
        data,
        rowHeight,
    });

    // Default value is 1 for the border
    const [heightDiff, setHeightDiff] = useDebounceState(1, 100);

    // Height of the list (including scrollbars and borders) to display
    const displayHeight = Math.min(
        maxHeight,
        headerRowHeight + totalSize(maxHeight) + heightDiff
    );

    setHeightDiff(height ? displayHeight - height : 0);

    const {
        fullWidth,
        totalWidth: contentWidth,
        columnWidths,
        columnRights,
    } = useColumnWidths(columns, width);


    const innerRef = useRef<HTMLDivElement>(null);
    const getInnerBoundingClientRect = useGetBoundingClientRect(innerRef);

    // Scroll to any given cell making sure it is in view
    const scrollTo = useCallback(
        (cell: Cell & ScrollBehavior) => {
            if (!height || !width) {
                return;
            }

            if (!cell.doNotScrollY) {
                // Align top
                const topMax = getRowSize(cell.row).top;
                // Align bottom
                const topMin =
                    getRowSize(cell.row).top +
                    getRowSize(cell.row).height +
                    headerRowHeight -
                    height +
                    1;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const scrollTop = outerRef.current!.scrollTop;

                if (scrollTop > topMax) {
                    outerRef.current!.scrollTop = topMax;
                } else if (scrollTop < topMin) {
                    outerRef.current!.scrollTop = topMin;
                }
            }

            if (
                columnRights &&
                columnWidths &&
                outerRef.current &&
                !cell.doNotScrollX
            ) {
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
                    1;

                const scrollLeft = outerRef.current.scrollLeft;

                if (scrollLeft > leftMax) {
                    outerRef.current.scrollLeft = leftMax;
                } else if (scrollLeft < leftMin) {
                    outerRef.current.scrollLeft = leftMin;
                }
            }
        },
        [
            height,
            width,
            headerRowHeight,
            columnRights,
            columnWidths,
            getRowSize,
            hasStickyRightColumn,
        ]
    );

    // Extract the coordinates of the cursor from a mouse event
    const getCursorIndex = useCallback((
        event: MouseEvent,
        force: boolean = false,
        includeSticky: boolean = false
    ): Cell | null => {
        const innerBoundingClientRect = getInnerBoundingClientRect(force);
        const outerBoundingClientRect =
            includeSticky && getOuterBoundingClientRect(force);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        columnRights,
        columnWidths,
        getInnerBoundingClientRect,
        getOuterBoundingClientRect,
        headerRowHeight,
        hasStickyRightColumn,
        getRowIndex,
        data.length,
    ]);

    return {
        outerRef,
        width,
        height,
        displayHeight,
        contentWidth,
        columnWidths,
        columnRights,
        getRowSize,
        totalSize,
        fullWidth,
        setHeightDiff,
        innerRef,
        scrollTo,
        getCursorIndex
    };
};
