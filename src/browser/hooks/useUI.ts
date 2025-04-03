import { useCallback, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useGetBoundingClientRect } from './useGetBoundingClientRect';
import { Cell, ScrollBehavior, useColumnWidths, useDebounceState, useDatagridContext } from '../../core';

const BORDER_WIDTH = 1;

export const useUI = () => {
    const {
        data,
        columns,
        hasStickyRightColumn,
        getRowSize,
        getRowTotalSize,
        getRowIndex,
        maxHeight, 
        headerRowHeight
    } = useDatagridContext();

    const outerRef = useRef<HTMLDivElement>(null);

    const getOuterBoundingClientRect = useGetBoundingClientRect(outerRef);

    // Width and height of the scrollable area
    const { width, height } = useResizeDetector({
        targetRef: outerRef,
        refreshMode: 'throttle',
        refreshRate: 100,
    });

    const [heightDiff, setHeightDiff] = useDebounceState(BORDER_WIDTH, 100);

    // Height of the list (including scrollbars and borders) to display
    const displayHeight = Math.min(
        maxHeight,
        headerRowHeight + getRowTotalSize(maxHeight) + heightDiff
    );

    setHeightDiff(height ? displayHeight - height : 0);

    const {
        isFullWidth,
        totalWidth: contentWidth,
        columnWidths,
        columnRights,
    } = useColumnWidths(columns, width);

    const innerRef = useRef<HTMLDivElement>(null);
    const getInnerBoundingClientRect = useGetBoundingClientRect(innerRef);

    // Scroll to any given cell making sure it is in view
    const scrollTo = useCallback(
        (cell: Cell & ScrollBehavior) => {
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
        isFullWidth,
        setHeightDiff,
        innerRef,
        scrollTo,
        getCursorIndex
    };
};
