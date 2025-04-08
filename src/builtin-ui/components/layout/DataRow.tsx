import cx from 'classnames';
import { RowData } from '../../../core';
import { DataCell } from './DataCell';
import { memo } from 'react';
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import { UseDatagridReturn } from '../../../browser';

export type DataRowProps<TRow extends RowData> = Pick<UseDatagridReturn<TRow>, 'columns' | 'data' | 'isFullWidth' | 'selection' | 'activeCell'> & {
    readonly row: VirtualItem;
    readonly colVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

function DataRowImpl<TRow extends RowData = RowData>({
    columns,
    data,
    isFullWidth,
    selection,
    activeCell,
    colVirtualizer,
    row
}: DataRowProps<TRow>) {
    const selectionMinRow = selection.range?.min.row ?? activeCell?.row;
    const selectionMaxRow = selection.range?.max.row ?? activeCell?.row;

    const rowActive = Boolean(
        row.index >= (selectionMinRow ?? Infinity) &&
        row.index <= (selectionMaxRow ?? -Infinity)
    );

    return (
        <div
            className={cx('dsg-row')}
            style={{
                height: row.size,
                top: row.start,
                width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
            }}
        >
            {colVirtualizer.getVirtualItems().map((col) => {
                const disabled = columns[col.index].disabled;
                const cellDisabled = disabled === true || (typeof disabled === 'function' &&
                    disabled({
                        rowData: data[row.index],
                        rowIndex: row.index,
                    }));

                return (
                    <DataCell
                        key={col.key}
                        col={col}
                        row={row}
                        disabled={cellDisabled}
                        rowActive={rowActive}
                    />
                );
            })}
        </div>
    );
}

export const DataRow = memo(DataRowImpl);
