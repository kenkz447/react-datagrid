import {
    useCallback,
} from 'react';
import {
    Cell,
    Operation,
    RowData,
} from '../types';
import deepEqual from 'fast-deep-equal';

interface UseControllerProps<TRow> {
    dataRef,
    columns,
    data,
    activeCell,
    selection,
    setActiveCell,
    setSelectionCell,
    editing,
    isCellDisabled,
    deleteRows,
    lockRows,
    createRow,
    duplicateRow,
    onChange,
    hasStickyRightColumn,
    disableSmartDelete,
    setEditing,
}

export const useController = <TRow extends RowData>(props: UseControllerProps<TRow>) => {
    const {
        dataRef,
        columns,
        data,
        activeCell,
        selection,
        setActiveCell,
        setSelectionCell,
        editing,
        isCellDisabled,
        deleteRows,
        lockRows,
        createRow,
        duplicateRow,
        onChange,
        hasStickyRightColumn,
        disableSmartDelete,
        setEditing,
    } = props;

    const duplicateRows = useCallback(
        (rowMin: number, rowMax: number = rowMin) => {
            if (lockRows) {
                return;
            }

            onChange?.(
                [
                    ...dataRef.current.slice(0, rowMax + 1),
                    ...dataRef.current
                        .slice(rowMin, rowMax + 1)
                        .map((rowData, i) => duplicateRow ? duplicateRow({ rowData, rowIndex: i + rowMin }) : { ...rowData }),
                    ...dataRef.current.slice(rowMax + 1),
                ],
                [
                    {
                        type: 'CREATE',
                        fromRowIndex: rowMax + 1,
                        toRowIndex: rowMax + 2 + rowMax - rowMin,
                    },
                ]
            );
            setActiveCell({ col: 0, row: rowMax + 1, doNotScrollX: true });
            setSelectionCell({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: 2 * rowMax - rowMin + 1,
                doNotScrollX: true,
            });
            setEditing(false);
        },
        [
            columns.length,
            duplicateRow,
            lockRows,
            onChange,
            setActiveCell,
            setSelectionCell,
            hasStickyRightColumn,
        ]
    );

    const applyPasteDataToDatasheet = useCallback(
        async (pasteData: string[][]) => {
            if (!editing && activeCell) {
                const min: Cell = selection?.min || activeCell;
                const max: Cell = selection?.max || activeCell;

                const results = await Promise.all(
                    pasteData[0].map((_, columnIndex) => {
                        const prePasteValues =
                            columns[min.col + columnIndex + 1]?.prePasteValues;

                        const values = pasteData.map((row) => row[columnIndex]);
                        return prePasteValues?.(values) ?? values;
                    })
                );

                pasteData = pasteData.map((_, rowIndex) =>
                    results.map((column) => column[rowIndex])
                );

                // Paste single row
                if (pasteData.length === 1) {
                    const newData = [...data];

                    for (
                        let columnIndex = 0;
                        columnIndex < pasteData[0].length;
                        columnIndex++
                    ) {
                        const pasteValue = columns[min.col + columnIndex + 1]?.pasteValue;

                        if (pasteValue) {
                            for (
                                let rowIndex = min.row;
                                rowIndex <= max.row;
                                rowIndex++
                            ) {
                                if (
                                    !isCellDisabled({
                                        col: columnIndex + min.col,
                                        row: rowIndex,
                                    })
                                ) {
                                    newData[rowIndex] = await pasteValue({
                                        rowData: newData[rowIndex],
                                        value: pasteData[0][columnIndex],
                                        rowIndex,
                                    });
                                }
                            }
                        }
                    }

                    onChange?.(newData, [
                        {
                            type: 'UPDATE',
                            fromRowIndex: min.row,
                            toRowIndex: max.row + 1,
                        },
                    ]);
                    setActiveCell({ col: min.col, row: min.row });
                    setSelectionCell({
                        col: Math.min(
                            min.col + pasteData[0].length - 1,
                            columns.length - (hasStickyRightColumn ? 3 : 2)
                        ),
                        row: max.row,
                    });
                } else {
                    // Paste multiple rows
                    let newData = [...data];
                    const missingRows = min.row + pasteData.length - data?.length;

                    if (missingRows > 0) {
                        if (!lockRows) {
                            newData = [
                                ...newData,
                                ...new Array(missingRows).fill(0).map(() => createRow ? createRow() : {} as TRow),
                            ];
                        } else {
                            pasteData.splice(pasteData.length - missingRows, missingRows);
                        }
                    }

                    for (
                        let columnIndex = 0;
                        columnIndex < pasteData[0].length &&
                        min.col + columnIndex <
                        columns.length - (hasStickyRightColumn ? 2 : 1);
                        columnIndex++
                    ) {
                        const pasteValue =
                            columns[min.col + columnIndex + 1]?.pasteValue;

                        if (pasteValue) {
                            for (
                                let rowIndex = 0;
                                rowIndex < pasteData.length;
                                rowIndex++
                            ) {
                                if (
                                    !isCellDisabled({
                                        col: min.col + columnIndex,
                                        row: min.row + rowIndex,
                                    })
                                ) {
                                    newData[min.row + rowIndex] = await pasteValue({
                                        rowData: newData[min.row + rowIndex],
                                        value: pasteData[rowIndex][columnIndex],
                                        rowIndex: min.row + rowIndex,
                                    });
                                }
                            }
                        }
                    }

                    const operations: Operation[] = [
                        {
                            type: 'UPDATE',
                            fromRowIndex: min.row,
                            toRowIndex:
                                min.row +
                                pasteData.length -
                                (!lockRows && missingRows > 0 ? missingRows : 0),
                        },
                    ];

                    if (missingRows > 0 && !lockRows) {
                        operations.push({
                            type: 'CREATE',
                            fromRowIndex: min.row + pasteData.length - missingRows,
                            toRowIndex: min.row + pasteData.length,
                        });
                    }

                    onChange?.(newData, operations);
                    setActiveCell({ col: min.col, row: min.row });
                    setSelectionCell({
                        col: Math.min(
                            min.col + pasteData[0].length - 1,
                            columns.length - (hasStickyRightColumn ? 3 : 2)
                        ),
                        row: min.row + pasteData.length - 1,
                    });
                }
            }
        },
        [
            activeCell,
            columns,
            createRow,
            data,
            editing,
            hasStickyRightColumn,
            isCellDisabled,
            lockRows,
            onChange,
            selection?.max,
            selection?.min,
            setActiveCell,
            setSelectionCell,
        ]
    );

    const deleteSelection = useCallback(
        (_smartDelete = true) => {
            const smartDelete = _smartDelete && !disableSmartDelete;
            if (!activeCell) {
                return;
            }

            const min: Cell = selection?.min || activeCell;
            const max: Cell = selection?.max || activeCell;

            if (
                data?.slice(min.row, max.row + 1).every((rowData, i) =>
                    columns.every((column) =>
                        column.isCellEmpty({ rowData, rowIndex: i + min.row })
                    )
                )
            ) {
                if (smartDelete) {
                    deleteRows(min.row, max.row);
                }
                return;
            }

            const newData = [...data];

            for (let row = min.row; row <= max.row; ++row) {
                for (let col = min.col; col <= max.col; ++col) {
                    if (!isCellDisabled({ col, row })) {
                        const { deleteValue = ({ rowData }) => rowData } =
                            columns[col + 1];
                        newData[row] = deleteValue({
                            rowData: newData[row],
                            rowIndex: row,
                        });
                    }
                }
            }

            if (smartDelete && deepEqual(newData, data)) {
                setActiveCell({ col: 0, row: min.row, doNotScrollX: true });
                setSelectionCell({
                    col: columns.length - (hasStickyRightColumn ? 3 : 2),
                    row: max.row,
                    doNotScrollX: true,
                });
                return;
            }

            onChange?.(newData, [
                {
                    type: 'UPDATE',
                    fromRowIndex: min.row,
                    toRowIndex: max.row + 1,
                },
            ]);
        },
        [
            disableSmartDelete,
            activeCell,
            columns,
            data,
            deleteRows,
            isCellDisabled,
            onChange,
            selection?.max,
            selection?.min,
            setActiveCell,
            setSelectionCell,
            hasStickyRightColumn,
        ]
    );

    return {
        duplicateRows,
        applyPasteDataToDatasheet,
        deleteSelection
    };
};
