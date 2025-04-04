import type { RowData } from '../../../core';
import { useDatagridContext } from '../../../browser';
import { HeaderRow } from './HeaderRow';
import { DataRow } from './DataRow';
import { SelectionRect } from './SelectionRect';
import { EdgesDetector } from './EdgesDetector';
import { TabIndexBefore } from './TabIndexBefore';
import { TabIndexAfter } from './TabIndexAfter';
import React, { useMemo } from 'react';

// ===== Main Component =====
function DatagridImpl<TRow extends RowData = RowData>() {
    const {
        outerRef,
        innerRef,
        beforeTabIndexRef,
        afterTabIndexRef,
        displayHeight,
        isFullWidth,
        colVirtualizer,
        rowVirtualizer,
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
        hasStickyRightColumn
    } = useDatagridContext<TRow>();

    const innerStyle = useMemo(() => ({
        width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
        height: rowVirtualizer.getTotalSize(),
    }), [isFullWidth, colVirtualizer, rowVirtualizer]);

    return (
        <div
            ref={outerRef}
            className="dsg-container"
            style={{ height: displayHeight }}
        >
            <TabIndexBefore
                beforeTabIndexRef={beforeTabIndexRef}
                columns={columns}
                data={data}
                setActiveCell={setActiveCell}
            />
            <div
                ref={innerRef}
                style={innerStyle}
            >
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
            <TabIndexAfter
                afterTabIndexRef={afterTabIndexRef}
                columns={columns}
                data={data}
                setActiveCell={setActiveCell}
                hasStickyRightColumn={hasStickyRightColumn}
            />
        </div>
    );
}

export const Datagrid = React.memo(DatagridImpl);

