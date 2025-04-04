import cx from 'classnames';
import { UseDatagridReturn, useEdges } from '../../../browser';
import React from 'react';
import { useWhatChanged } from '../../../core';

type EdgesDetectorProps = Pick<UseDatagridReturn,
    | 'outerRef'
    | 'headerRowHeight'
    | 'columnWidths'
    | 'getRowSize'
    | 'hasStickyRightColumn'
    | 'height'
    | 'width'
    | 'contentWidth'
> & {
    dataLength: number;
};

/**
 * A component that detects edges of a scrollable container and applies appropriate CSS classes.
 * 
 * The EdgesDetectorImpl renders a scrollable view with visual indicators for when content has
 * reached the edges of its container. It dynamically applies CSS classes based on the detection
 * of top, right, bottom, and left edges.
 * 
 * @param props - The properties for the EdgesDetector component
 * 
 * @returns A div containing a scrollable view with appropriate edge detection classes
 */
export function EdgesDetectorImpl({
    outerRef,
    headerRowHeight,
    columnWidths,
    height,
    width,
    contentWidth,
    dataLength,
    getRowSize,
    hasStickyRightColumn
}: EdgesDetectorProps) {

    const edges = useEdges(outerRef, width, height);

    const scrollableViewStyle = React.useMemo(() => ({
        top: headerRowHeight,
        left: columnWidths?.[0] ?? 0,
        height: height ? height - headerRowHeight : 0,
        width: contentWidth && width
            ? width - columnWidths[0] - (hasStickyRightColumn ? columnWidths[columnWidths.length - 1] : 0)
            : `calc(100% - ${columnWidths?.[0] + (hasStickyRightColumn ? columnWidths?.[columnWidths.length - 1] : 0)}px)`,
    }), [headerRowHeight, height, width, contentWidth, columnWidths, hasStickyRightColumn]);

    return (
        <div
            className="dsg-scrollable-view-container"
            style={{
                height: getRowSize(dataLength - 1).top + getRowSize(dataLength - 1).height + headerRowHeight,
                width: contentWidth ? contentWidth : '100%',
            }}
        >
            <div
                className={cx({
                    'dsg-scrollable-view': true,
                    'dsg-scrollable-view-t': !edges.top,
                    'dsg-scrollable-view-r': !edges.right,
                    'dsg-scrollable-view-b': !edges.bottom,
                    'dsg-scrollable-view-l': !edges.left,
                })}
                style={scrollableViewStyle}
            />
        </div>
    );
}

export const EdgesDetector = React.memo(EdgesDetectorImpl);

