import { useCallback, useRef, useState } from 'react';
import { RowData } from '../types';

interface UseRowProps<TRow> {
    data: TRow[];
    onChange;
    createRow?;
    lockRows;
    autoAddRow;
    setActiveCell;
    setSelectionCell;
    activeCell;
}

export const useRow = <TRow extends RowData>(props: UseRowProps<TRow>) => {
    const {
        data,
        onChange,
        createRow,
        lockRows,
        autoAddRow,
        setActiveCell,
        setSelectionCell,
        activeCell,
    } = props;

    const dataRef = useRef(data);
    dataRef.current = data;

    const [editing, setEditing] = useState(false);

    const insertRowAfter = useCallback(
        (row: number, count = 1) => {
            if (lockRows) {
                return;
            }

            setSelectionCell(null);
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
        [createRow, lockRows, onChange, setActiveCell, setSelectionCell]
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
        [onChange]
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
            setSelectionCell(null);
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
        [lockRows, onChange, setActiveCell, setSelectionCell]
    );

    const stopEditing = useCallback(
        ({ nextRow = true } = {}) => {
            if (activeCell?.row === dataRef.current.length - 1) {
                if (nextRow && autoAddRow) {
                    insertRowAfter(activeCell.row);
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
        [activeCell?.row, autoAddRow, insertRowAfter, setActiveCell]
    );

    return {
        editing,
        dataRef,
        insertRowAfter,
        setRowData,
        deleteRows,
        stopEditing,
        setEditing,
    };
};
