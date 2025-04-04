import cx from 'classnames';
import { UseDatagridReturn, useEdges } from '../../../browser';
import React from 'react';

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
 * A component that detects edges in a scrollable data grid and provides visual indicators
 * for scroll boundaries.
 * 
 * @returns A scrollable container with edge detection visual indicators
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

    const containerStyle = React.useMemo(() => ({
        height: getRowSize(dataLength - 1).top + getRowSize(dataLength - 1).height + headerRowHeight,
        width: contentWidth ? contentWidth : '100%',
    }), [dataLength, getRowSize, headerRowHeight, contentWidth]);

    const viewPortStyle = React.useMemo(() => ({
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
            style={containerStyle}
        >
            <div
                className={cx({
                    'dsg-scrollable-view': true,
                    'dsg-scrollable-view-t': !edges.top,
                    'dsg-scrollable-view-r': !edges.right,
                    'dsg-scrollable-view-b': !edges.bottom,
                    'dsg-scrollable-view-l': !edges.left,
                })}
                style={viewPortStyle}
            />
        </div>
    );
}

export const EdgesDetector = React.memo(EdgesDetectorImpl);

