import React, { useMemo } from 'react';
import type { RowData } from '../../core';
import { useDatagridContext } from '../../browser';
import { useVirtualizers } from '../hooks/useVirtualizers';
import { HeaderRow } from './layout/HeaderRow';
import { DataRow } from './layout/DataRow';
import { SelectionRect } from './layout/SelectionRect';
import { EdgesDetector } from './layout/EdgesDetector';
import { TabIndexBefore } from './layout/TabIndexBefore';
import { useContextMenu } from '../hooks/useContextMenu';
import { useKeyBindings } from '../hooks/useKeyBindings';
import { useDragSelect } from '../hooks/useDragSelect';

// ===== Main Component =====
function DatagridImpl<TRow extends RowData = RowData>() {
    const datagrid = useDatagridContext<TRow>();

    const {
        outerRef,
        innerRef,
        isFullWidth,
        headerRowHeight,
        columnWidths,
        height,
        width,
        contentWidth,
        data,
        columns,
        selection,
        activeCell,
        setActiveCell,
        getRowSize,
        hasStickyRightColumn,
        rowKey
    } = datagrid;

    useKeyBindings(datagrid);
    useContextMenu(datagrid);
    useDragSelect(datagrid);

    const { rowVirtualizer, colVirtualizer } = useVirtualizers({
        data,
        outerRef,
        headerRowHeight,
        columnWidths,
        getRowSize,
        columns,
        hasStickyRightColumn,
        rowKey
    });

    const innerStyle = useMemo(() => ({
        width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
        height: rowVirtualizer.getTotalSize(),
    }), [isFullWidth, colVirtualizer, rowVirtualizer]);

    return (
        <div
            ref={outerRef}
            className="dsg-container"
        >
            <TabIndexBefore
                columns={columns}
                data={data}
                setActiveCell={setActiveCell}
            />
            <div ref={innerRef} style={innerStyle}>
                <HeaderRow
                    headerRowHeight={headerRowHeight}
                    columns={columns}
                    isFullWidth={isFullWidth}
                    hasStickyRightColumn={hasStickyRightColumn}
                    selection={selection}
                    activeCell={activeCell}
                    colVirtualizer={colVirtualizer}
                />
                {rowVirtualizer.getVirtualItems().map((row) => (
                    <DataRow
                        key={row.key}
                        row={row}
                        columns={columns}
                        data={data}
                        isFullWidth={isFullWidth}
                        selection={selection}
                        activeCell={activeCell}
                        colVirtualizer={colVirtualizer}
                    />
                ))}
                <EdgesDetector
                    dataLength={data.length}
                    outerRef={outerRef}
                    headerRowHeight={headerRowHeight}
                    columnWidths={columnWidths}
                    height={height}
                    width={width}
                    contentWidth={contentWidth}
                    getRowSize={getRowSize}
                    hasStickyRightColumn={hasStickyRightColumn}
                />
                <SelectionRect />
            </div>
        </div>
    );
}

export const Datagrid = React.memo(DatagridImpl);

