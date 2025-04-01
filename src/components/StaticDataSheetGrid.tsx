import { DataSheetGridProps, RowData } from '../types';
import { useState } from 'react';
import { DataSheetGrid } from './DataSheetGrid';

export function StaticDataSheetGrid<T extends RowData = RowData>({
    columns, gutterColumn, stickyRightColumn, addRowsComponent, createRow, duplicateRow, style, rowKey, onFocus, onBlur, onActiveCellChange, onSelectionChange, rowClassName, rowHeight, ...rest
}: DataSheetGridProps<T>) {
    const [staticProps] = useState({
        columns,
        gutterColumn,
        stickyRightColumn,
        addRowsComponent,
        createRow,
        duplicateRow,
        style,
        rowKey,
        onFocus,
        onBlur,
        onActiveCellChange,
        onSelectionChange,
        rowClassName,
        rowHeight,
    });

    return (
        <DataSheetGrid
            {...staticProps}
            {...rest}
            rowHeight={typeof rowHeight === 'number' ? rowHeight : staticProps.rowHeight}
        />
    );
}
