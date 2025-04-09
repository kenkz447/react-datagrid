import { useCallback, useEffect, useRef, useState } from 'react';
import { RowData, UseDatagridReturn } from '@basestacks/react-datagrid';

export const useRows = <TRow extends RowData = RowData>(dataGrid: UseDatagridReturn<TRow>) => {
    const isFirstRender = useRef(true);

    const {
        data,
        rowKey,
        columns,
        activeCell,
        editing,
        deleteGivenRow,
        duplicateGivenRow,
        insertAfterGivenRow,
        setGivenRowData,
        stopEditing
    } = dataGrid;

    const createRows = useCallback(() => {
        return data.map((row, index) => {
            return {
                key: typeof rowKey === 'function' ? rowKey({ rowData: row, rowIndex: index }) : rowKey ?? 'id',
                index,
                data: row,
                cells: columns.map((column, columnIndex) => {
                    const cellIsActive = activeCell?.row === row.index && activeCell?.col === columnIndex - 1;
                    const cellDisabled = (typeof column.disabled === 'function' && column.disabled({ rowData: data[row.index], rowIndex: row.index, })) || column.disabled === true;
                    const focus = cellIsActive && editing;

                    const cellProps = {
                        key: column.id ?? '0',
                        rowData: row,
                        rowIndex: row.index,
                        columnIndex,
                        columnData: columns[columnIndex].columnData,
                        value: row[column.id as keyof TRow],
                        active: cellIsActive,
                        disabled: cellDisabled,
                        focus,
                        deleteRow: deleteGivenRow(row.index),
                        duplicateRow: duplicateGivenRow(row.index),
                        insertRowBelow: insertAfterGivenRow(row.index),
                        setRowData: setGivenRowData(row.index),
                        stopEditing
                    };

                    return {
                        ...cellProps,
                        render: () => {
                            const Component = column.component;

                            if (!Component) {
                                return cellProps.value;
                            }

                            return (<Component {...cellProps} />);
                        },
                    };
                })
            };
        });
    }, [activeCell?.col, activeCell?.row, columns, data, deleteGivenRow, duplicateGivenRow, editing, insertAfterGivenRow, rowKey, setGivenRowData, stopEditing]);

    const [rows, setRows] = useState(() => {
        return createRows();
    });

    useEffect(() => {
        // This effect will run on every render, 
        // but we only want to update the rows if it's not the first render.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setRows(createRows());
    }, [data, rowKey, columns, createRows]);

    return rows;
};
