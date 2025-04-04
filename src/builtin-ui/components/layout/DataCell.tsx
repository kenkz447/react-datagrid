import cx from 'classnames';
import { Cell } from './Cell';
import { CellClassName, RowData } from '../../../core';

export interface DataCellProps<TRow extends RowData = RowData> {
    readonly col: {
        readonly index: number;
        readonly key: string | number;
        readonly size: number;
        readonly start: number;
    };
    readonly row: {
        readonly index: number;
        readonly key: string | number;
        readonly size: number;
        readonly start: number;
    };
    readonly columns: any[];
    readonly data: TRow[];
    readonly cellClassName?: CellClassName<TRow>;
    readonly columnCellClassName?: CellClassName<any>;
    readonly hasStickyRightColumn: boolean;
    readonly activeCell: { readonly row: number; readonly col: number } | null;
    readonly editing: boolean;
    readonly disabled: boolean;
    readonly deleteRow: () => void;
    readonly duplicateRow: () => void;
    readonly insertRowBelow: () => void;
    readonly stopEditing: () => void;
    readonly setRowData: (data: Partial<TRow>) => void;
    readonly rowActive: boolean;
}

export function DataCell<TRow extends RowData = RowData>({
    col,
    row,
    columns,
    data,
    cellClassName,
    columnCellClassName,
    hasStickyRightColumn,
    activeCell,
    editing,
    disabled,
    deleteRow,
    duplicateRow,
    insertRowBelow,
    stopEditing,
    setRowData,
    rowActive
}: DataCellProps<TRow>) {
    const Component = columns[col.index].component;
    const cellIsActive = activeCell?.row === row.index && activeCell.col === col.index - 1;

    return (
        <Cell
            key={col.key}
            gutter={col.index === 0}
            stickyRight={hasStickyRightColumn && col.index === columns.length - 1}
            active={col.index === 0 && rowActive}
            disabled={disabled}
            className={cx(
                typeof columnCellClassName === 'function'
                    ? columnCellClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                        columnId: columns[col.index].id,
                    })
                    : columnCellClassName,
                typeof cellClassName === 'function'
                    ? cellClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                        columnId: columns[col.index].id,
                    })
                    : cellClassName
            )}
            width={col.size}
            left={col.start}
        >
            <Component
                rowData={data[row.index]}
                disabled={disabled}
                active={cellIsActive}
                columnIndex={col.index - 1}
                rowIndex={row.index}
                focus={cellIsActive && editing}
                deleteRow={deleteRow}
                duplicateRow={duplicateRow}
                stopEditing={stopEditing}
                insertRowBelow={insertRowBelow}
                setRowData={setRowData}
                columnData={columns[col.index].columnData}
            />
        </Cell>
    );
}
