import { PropsWithChildren } from 'react';
import type { RowData } from '../../../core';
import { useMemoizedIndexCallback } from '../../../core';
import { useVirtualizers, useDatagridContext } from '../../../browser';
import { HeaderRow } from './HeaderRow';
import { DataRow } from './DataRow';

export interface GridProps {
}

// ===== Main Component =====
export function Grid<TRow extends RowData = RowData>({ children }: PropsWithChildren<GridProps>) {
    const {
        propsRef,
        data,
        columns,
        hasStickyRightColumn,
        selection,
        activeCell,
        editing,
        headerRowHeight,
        getRowSize,
        setRowData,
        deleteRows,
        duplicateRows,
        insertRowAfter,
        stopEditing,
        outerRef,
        innerRef,
        columnWidths,
        displayHeight,
        isFullWidth,
    } = useDatagridContext<TRow>();

    const {
        rowKey,
        rowClassName,
        cellClassName,
        onScroll,
    } = propsRef.current;

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

    const setGivenRowData = useMemoizedIndexCallback(setRowData, 1);
    const deleteGivenRow = useMemoizedIndexCallback(deleteRows, 0);
    const duplicateGivenRow = useMemoizedIndexCallback(duplicateRows, 0);
    const insertAfterGivenRow = useMemoizedIndexCallback(insertRowAfter, 0);

    const selectionColMin = selection?.min.col ?? activeCell?.col;
    const selectionColMax = selection?.max.col ?? activeCell?.col;
    const selectionMinRow = selection?.min.row ?? activeCell?.row;
    const selectionMaxRow = selection?.max.row ?? activeCell?.row;

    return (
        <div
            ref={outerRef}
            className="dsg-container"
            onScroll={onScroll}
            style={{ height: displayHeight }}
        >
            <div
                ref={innerRef}
                style={{
                    width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
                    height: rowVirtualizer.getTotalSize(),
                }}
            >
                <HeaderRow
                    headerRowHeight={headerRowHeight}
                    colVirtualizer={colVirtualizer}
                    columns={columns}
                    isFullWidth={isFullWidth}
                    hasStickyRightColumn={hasStickyRightColumn}
                    selectionColMin={selectionColMin}
                    selectionColMax={selectionColMax}
                />

                {rowVirtualizer.getVirtualItems().map((row) => (
                    <DataRow
                        key={row.key}
                        row={row}
                        colVirtualizer={colVirtualizer}
                        columns={columns}
                        data={data}
                        rowClassName={rowClassName}
                        isFullWidth={isFullWidth}
                        hasStickyRightColumn={hasStickyRightColumn}
                        activeCell={activeCell}
                        editing={editing}
                        selectionMinRow={selectionMinRow}
                        selectionMaxRow={selectionMaxRow}
                        cellClassName={cellClassName}
                        deleteGivenRow={deleteGivenRow}
                        duplicateGivenRow={duplicateGivenRow}
                        insertAfterGivenRow={insertAfterGivenRow}
                        setGivenRowData={setGivenRowData}
                        stopEditing={stopEditing}
                    />
                ))}

                {children}
            </div>
        </div>
    );
}
