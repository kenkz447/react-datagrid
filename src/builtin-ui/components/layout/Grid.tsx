import type { RowData } from '../../../core';
import { useDatagridContext } from '../../../browser';
import { HeaderRow } from './HeaderRow';
import { DataRow } from './DataRow';
import { SelectionRect } from './SelectionRect';
import { EdgesDetector } from './EdgesDetector';
import { TabIndexBefore } from './TabIndexBefore';
import { TabIndexAfter } from './TabIndexAfter';

export interface GridProps {
}

// ===== Main Component =====
export function Grid<TRow extends RowData = RowData>() {
    const {
        propsRef,
        outerRef,
        innerRef,
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
        getRowSize,
        hasStickyRightColumn
    } = useDatagridContext<TRow>();

    const { onScroll } = propsRef.current;

    return (
        <div
            ref={outerRef}
            className="dsg-container"
            onScroll={onScroll}
            style={{ height: displayHeight }}
        >
            <TabIndexBefore />
            <div
                ref={innerRef}
                style={{
                    width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
                    height: rowVirtualizer.getTotalSize(),
                }}
            >
                <HeaderRow />
                {rowVirtualizer.getVirtualItems().map((row) => (
                    <DataRow key={row.key} row={row} />
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
            <TabIndexAfter />
        </div>
    );
}
