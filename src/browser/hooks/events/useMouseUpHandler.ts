import { useCallback } from 'react';
import { Cell, useDatagridContext } from '../../../core';

export const useMouseUpHandler = () => {
    const {
        propsRef,
        columns,
        data,
        setSelectionCell,
        expandingSelectionFromRowIndex,
        expandSelectionRowsCount,
        setExpandSelectionRowsCount,
        activeCell,
        selection,
        isCellDisabled,
        setActiveCell,
        setExpandingSelectionFromRowIndex,
        setSelectionMode
    } = useDatagridContext();

    const { onChange } = propsRef.current;

    const onMouseUp = useCallback(() => {
        if (expandingSelectionFromRowIndex !== null) {
            if (expandSelectionRowsCount > 0 && activeCell) {
                let copyData: Array<Array<string>> = [];

                const min: Cell = selection?.min || activeCell;
                const max: Cell = selection?.max || activeCell;

                for (let row = min.row; row <= max.row; ++row) {
                    copyData.push([]);

                    for (let col = min.col; col <= max.col; ++col) {
                        const { copyValue = () => null } = columns[col + 1];
                        copyData[row - min.row].push(
                            String(copyValue({ rowData: data[row], rowIndex: row }) ?? '')
                        );
                    }
                }

                Promise.all(
                    copyData[0].map((_, columnIndex) => {
                        const prePasteValues =
                            columns[min.col + columnIndex + 1]?.prePasteValues;

                        const values = copyData.map((row) => row[columnIndex]);
                        return prePasteValues?.(values) ?? values;
                    })
                ).then((results) => {
                    copyData = copyData.map((_, rowIndex) =>
                        results.map((column) => column[rowIndex])
                    );

                    const newData = [...data];

                    for (
                        let columnIndex = 0;
                        columnIndex < copyData[0].length;
                        columnIndex++
                    ) {
                        const pasteValue =
                            columns[min.col + columnIndex + 1]?.pasteValue;

                        if (pasteValue) {
                            for (
                                let rowIndex = max.row + 1;
                                rowIndex <= max.row + expandSelectionRowsCount;
                                rowIndex++
                            ) {
                                if (
                                    !isCellDisabled({
                                        col: columnIndex + min.col,
                                        row: rowIndex,
                                    })
                                ) {
                                    newData[rowIndex] = pasteValue({
                                        rowData: newData[rowIndex],
                                        value:
                                            copyData[(rowIndex - max.row - 1) % copyData.length][
                                                columnIndex
                                            ],
                                        rowIndex,
                                    });
                                }
                            }
                        }
                    }

                    onChange?.(newData, [
                        {
                            type: 'UPDATE',
                            fromRowIndex: max.row + 1,
                            toRowIndex: max.row + 1 + expandSelectionRowsCount,
                        },
                    ]);
                });

                setExpandSelectionRowsCount(0);
                setActiveCell({
                    col: Math.min(
                        activeCell?.col ?? Infinity,
                        selection?.min.col ?? Infinity
                    ),
                    row: Math.min(
                        activeCell?.row ?? Infinity,
                        selection?.min.row ?? Infinity
                    ),
                    doNotScrollX: true,
                    doNotScrollY: true,
                });
                setSelectionCell({
                    col: Math.max(activeCell?.col ?? 0, selection?.max.col ?? 0),
                    row:
                        Math.max(activeCell?.row ?? 0, selection?.max.row ?? 0) +
                        expandSelectionRowsCount,
                });
            }
            setExpandingSelectionFromRowIndex(null);
        }

        setSelectionMode({
            columns: false,
            rows: false,
            active: false,
        });
    }, [
        expandingSelectionFromRowIndex,
        setSelectionMode,
        expandSelectionRowsCount,
        activeCell,
        selection?.min,
        selection?.max,
        data,
        onChange,
        setActiveCell,
        setSelectionCell,
        columns,
        isCellDisabled,
    ]);

    return onMouseUp;
};
