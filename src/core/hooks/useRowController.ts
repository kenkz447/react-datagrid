import {
    useCallback,
    useRef,
} from 'react';
import {
    Cell,
    Operation,
    RowData,
} from '../types';
import deepEqual from 'fast-deep-equal';
import { useMemoizedIndexCallback } from './internal/useMemoizedIndexCallback';
import { UseSelectionReturn } from './useSelection';

interface UseRowControllerProps<TRow extends RowData> {
    dataRef,
    columns,
    data,
    selection: UseSelectionReturn,
    activeCell,
    setActiveCell,
    editing,
    isCellDisabled,
    lockRows,
    createRow,
    duplicateRow,
    onChange,
    hasStickyRightColumn,
    disableSmartDelete,
    setEditing,
    autoAddRow
}


export const useRowController = <TRow extends RowData>(props: UseRowControllerProps<TRow>) => {
    const {
        dataRef,
        columns,
        data,
        activeCell,
        setActiveCell,
        selection,
        editing,
        isCellDisabled,
        lockRows,
        createRow,
        duplicateRow,
        onChange,
        hasStickyRightColumn,
        disableSmartDelete,
        setEditing,
        autoAddRow
    } = props;

    const activeCellRef = useRef(activeCell);
    activeCellRef.current = activeCell;

    const selectionRef = useRef(selection);
    selectionRef.current = selection;

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
            selectionRef.current.setSelectionCell({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: 2 * rowMax - rowMin + 1,
                doNotScrollX: true,
            });
            setEditing(false);
        },
        [lockRows, onChange, dataRef, setActiveCell, columns.length, hasStickyRightColumn, setEditing, duplicateRow]
    );

    const applyPasteDataToDatasheet = useCallback(
        async (pasteData: string[][]) => {
            if (!editing && activeCellRef.current) {
                const min: Cell = selectionRef.current?.range?.min || activeCellRef.current;
                const max: Cell = selectionRef.current?.range?.max || activeCellRef.current;

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
                    selectionRef.current.setSelectionCell({
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
                    selectionRef.current.setSelectionCell({
                        col: Math.min(
                            min.col + pasteData[0].length - 1,
                            columns.length - (hasStickyRightColumn ? 3 : 2)
                        ),
                        row: min.row + pasteData.length - 1,
                    });
                }
            }
        },
        [columns, createRow, data, editing, hasStickyRightColumn, isCellDisabled, lockRows, onChange, setActiveCell]
    );

    const deleteRows = useCallback(
        (rowMin: number, rowMax: number = rowMin) => {
            if (lockRows) {
                return;
            }

            setEditing(false);
            setActiveCell((a) => {
                const row = Math.min(
                    dataRef.current.length - 2 - rowMax + rowMin,
                    rowMin
                );

                if (row < 0) {
                    return null;
                }

                return a && { col: a.col, row };
            });
            selectionRef.current.setSelectionCell(null);
            onChange?.(
                [
                    ...dataRef.current.slice(0, rowMin),
                    ...dataRef.current.slice(rowMax + 1),
                ],
                [
                    {
                        type: 'DELETE',
                        fromRowIndex: rowMin,
                        toRowIndex: rowMax + 1,
                    },
                ]
            );
        },
        [dataRef, lockRows, onChange, setActiveCell, setEditing]
    );

    const deleteSelection = useCallback(
        (_smartDelete = true) => {
            const smartDelete = _smartDelete && !disableSmartDelete;
            if (!activeCellRef.current) {
                return;
            }

            const min: Cell = selectionRef.current?.range?.min || activeCellRef.current;
            const max: Cell = selectionRef.current?.range?.max || activeCellRef.current;

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
                selectionRef.current.setSelectionCell({
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
        [disableSmartDelete, data, onChange, columns, deleteRows, isCellDisabled, setActiveCell, hasStickyRightColumn]
    );

    const insertRowAfter = useCallback(
        (row: number, count = 1) => {
            if (lockRows) {
                return;
            }

            selectionRef.current.setSelectionCell(null);
            setEditing(false);

            onChange?.(
                [
                    ...dataRef.current.slice(0, row + 1),
                    ...new Array(count).fill(0).map(() => createRow?.() ?? {}),
                    ...dataRef.current.slice(row + 1),
                ],
                [
                    {
                        type: 'CREATE',
                        fromRowIndex: row + 1,
                        toRowIndex: row + 1 + count,
                    },
                ]
            );
            setActiveCell((a) => ({
                col: a?.col || 0,
                row: row + count,
                doNotScrollX: true,
            }));
        },
        [createRow, dataRef, lockRows, onChange, setActiveCell, setEditing]
    );

    const setRowData = useCallback(
        (rowIndex: number, item: TRow) => {
            onChange?.(
                [
                    ...(dataRef.current?.slice(0, rowIndex) ?? []),
                    item,
                    ...(dataRef.current?.slice(rowIndex + 1) ?? []),
                ],
                [
                    {
                        type: 'UPDATE',
                        fromRowIndex: rowIndex,
                        toRowIndex: rowIndex + 1,
                    },
                ]
            );
        },
        [dataRef, onChange]
    );

    const stopEditing = useCallback(
        ({ nextRow = true } = {}) => {
            if (activeCellRef.current?.row === dataRef.current.length - 1) {
                if (nextRow && autoAddRow) {
                    insertRowAfter(activeCellRef.current.row);
                } else {
                    setEditing(false);
                }
            } else {
                setEditing(false);

                if (nextRow) {
                    setActiveCell((a) => a && { col: a.col, row: a.row + 1 });
                }
            }
        },
        [autoAddRow, dataRef, insertRowAfter, setActiveCell, setEditing]
    );

    // Row Modifiers (but performed on a given index)
    const setGivenRowData = useMemoizedIndexCallback(setRowData, 1);
    const deleteGivenRow = useMemoizedIndexCallback(deleteRows, 0);
    const duplicateGivenRow = useMemoizedIndexCallback(duplicateRows, 0);
    const insertAfterGivenRow = useMemoizedIndexCallback(insertRowAfter, 0);

    return {
        duplicateRows,
        applyPasteDataToDatasheet,
        deleteSelection,
        deleteRows,
        insertRowAfter,
        setRowData,
        stopEditing,
        setGivenRowData,
        deleteGivenRow,
        duplicateGivenRow,
        insertAfterGivenRow,
    };
};
