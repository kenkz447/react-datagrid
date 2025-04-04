import cx from 'classnames';
import { useDatagridContext, useEdges } from '../../../browser';
import React from 'react';

export function ViewPortImpl() {
    const {
        outerRef,
        headerRowHeight,
        columnWidths,
        height,
        width,
        contentWidth,
        data,
        getRowSize,
        hasStickyRightColumn
    } = useDatagridContext();

    const edges = useEdges(outerRef, width, height);

    return (
        <div
            className="dsg-scrollable-view-container"
            style={{
                height: getRowSize(data.length - 1).top + getRowSize(data.length - 1).height + headerRowHeight,
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
                style={{
                    top: headerRowHeight,
                    left: columnWidths?.[0] ?? 0,
                    height: height ? height - headerRowHeight : 0,
                    width: contentWidth && width
                        ? width - columnWidths[0] - (hasStickyRightColumn ? columnWidths[columnWidths.length - 1] : 0)
                        : `calc(100% - ${columnWidths?.[0] + (hasStickyRightColumn ? columnWidths?.[columnWidths.length - 1] : 0)}px)`,
                }}
            />
        </div>
    );
}

export const ViewPort = React.memo(ViewPortImpl);

