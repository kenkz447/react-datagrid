import { Column, RowData } from '@basestacks/react-datagrid';

type ColumnData = { key: string; original: Partial<Column<any, any, any>> }

type CreateColumnOptions<TRow extends RowData, TKey extends keyof TRow = keyof TRow, TPasteValue = string> = Column<TRow[TKey], ColumnData, TPasteValue> & {
    readonly id: TKey;
}

export const createColumn = <TRow extends RowData, TKey extends keyof TRow = keyof TRow, TPasteValue = string>({ id, ...column }: CreateColumnOptions<TRow, TKey, TPasteValue>): Column<TRow[TKey], ColumnData, TPasteValue> => ({
    ...column,
    // We pass the key and the original column as columnData to be able to retrieve them in the cell component
    columnData: { key: id as string, original: column },
    // Here we simply wrap all functions to only pass the value of the desired key to the column, and not the entire row
    disabled: typeof column.disabled === 'function'
        ? ({ rowData, rowIndex }) => typeof column.disabled === 'function' ? column.disabled({ rowData: rowData[id], rowIndex }) : column.disabled ?? false
        : column.disabled,
    cellClassName: typeof column.cellClassName === 'function'
        ? ({ rowData, rowIndex, columnId }) => typeof column.cellClassName === 'function' ? column.cellClassName({ rowData: rowData[id], rowIndex, columnId }) : column.cellClassName ?? undefined
        : column.cellClassName,
    copyValue: ({ rowData, rowIndex }) =>
        column.copyValue?.({ rowData: rowData[id], rowIndex }) ?? null,
    deleteValue: ({ rowData, rowIndex }) => ({
        ...rowData,
        [id]: column.deleteValue?.({ rowData: rowData[id], rowIndex }) ?? null,
    }),
    pasteValue: ({ rowData, value, rowIndex }) => ({
        ...rowData,
        [id]: column.pasteValue?.({ rowData: rowData[id], value, rowIndex }) ?? null,
    }),
    isCellEmpty: ({ rowData, rowIndex }) => column.isCellEmpty?.({ rowData: rowData[id], rowIndex }) ?? false,
});
