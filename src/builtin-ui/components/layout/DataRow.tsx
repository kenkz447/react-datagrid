import cx from 'classnames';
import { DataSheetGridProps, RowData } from '../../../core';
import { DataCell } from './DataCell';

export interface DataRowProps<TRow extends RowData = RowData> {
    readonly row: {
        readonly index: number;
        readonly key: string | number;
        readonly size: number;
        readonly start: number;
    };
    readonly colVirtualizer: any;
    readonly columns: any[];
    readonly data: TRow[];
    readonly rowClassName?: DataSheetGridProps<TRow>['rowClassName'];
    readonly isFullWidth?: boolean;
    readonly hasStickyRightColumn: boolean;
    readonly activeCell: { readonly row: number; readonly col: number } | null;
    readonly editing: boolean;
    readonly selectionMinRow?: number;
    readonly selectionMaxRow?: number;
    readonly cellClassName?: DataSheetGridProps<TRow>['cellClassName'];
    readonly deleteGivenRow: (index: number) => () => void;
    readonly duplicateGivenRow: (index: number) => () => void;
    readonly insertAfterGivenRow: (index: number) => () => void;
    readonly setGivenRowData: (index: number) => (data: Partial<TRow>) => void;
    readonly stopEditing: () => void;
}

export function DataRow<TRow extends RowData = RowData>({
    row,
    colVirtualizer,
    columns,
    data,
    rowClassName,
    isFullWidth,
    hasStickyRightColumn,
    activeCell,
    editing,
    selectionMinRow,
    selectionMaxRow,
    cellClassName,
    deleteGivenRow,
    duplicateGivenRow,
    insertAfterGivenRow,
    setGivenRowData,
    stopEditing
}: DataRowProps<TRow>) {
    const rowActive = Boolean(
        row.index >= (selectionMinRow ?? Infinity) &&
        row.index <= (selectionMaxRow ?? -Infinity)
    );

    return (
        <div
            key={row.key}
            className={cx(
                'dsg-row',
                typeof rowClassName === 'string' ? rowClassName : null,
                typeof rowClassName === 'function'
                    ? rowClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                    })
                    : null
            )}
            style={{
                height: row.size,
                top: row.start,
                width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
            }}
        >
            {colVirtualizer.getVirtualItems().map((col) => {
                const columnCellClassName = columns[col.index].cellClassName;
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
                        columns={columns}
                        data={data}
                        columnCellClassName={columnCellClassName}
                        cellClassName={cellClassName}
                        hasStickyRightColumn={hasStickyRightColumn}
                        activeCell={activeCell}
                        editing={editing}
                        disabled={cellDisabled}
                        deleteRow={deleteGivenRow(row.index)}
                        duplicateRow={duplicateGivenRow(row.index)}
                        insertRowBelow={insertAfterGivenRow(row.index)}
                        setRowData={setGivenRowData(row.index)}
                        stopEditing={stopEditing}
                        rowActive={rowActive}
                    />
                );
            })}
        </div>
    );
}
