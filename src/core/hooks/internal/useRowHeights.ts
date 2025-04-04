import { DataSheetGridProps, RowData, RowSize } from '../../types';
import { useCallback, useRef } from 'react';

type UseRowHeightProps<TRow> = Pick<DataSheetGridProps<TRow>, 'rowHeight'> & {
    readonly dataRef?: React.RefObject<TRow[]>;
};

export const useRowHeights = <TRow extends RowData>({
    dataRef,
    rowHeight,
}: UseRowHeightProps<TRow>) => {
    const calculatedHeights = useRef<RowSize[]>([]);

    const dataLength = dataRef.current.length;

    const getRowIndex = useCallback(
        (top: number): number => {
            if (typeof rowHeight === 'number') {
                return Math.min(
                    dataLength - 1,
                    Math.max(-1, Math.floor(top / rowHeight))
                );
            }

            let l = 0;
            let r = calculatedHeights.current.length - 1;

            while (l <= r) {
                const m = Math.floor((l + r) / 2);

                if (calculatedHeights.current[m].top < top) {
                    l = m + 1;
                } else if (calculatedHeights.current[m].top > top) {
                    r = m - 1;
                } else {
                    return m;
                }
            }

            if (
                r === calculatedHeights.current.length - 1 &&
                dataLength > calculatedHeights.current.length &&
                (!calculatedHeights.current.length ||
                    top >=
                    calculatedHeights.current[r].top +
                    calculatedHeights.current[r].height)
            ) {
                let lastBottom =
                    r === -1
                        ? 0
                        : calculatedHeights.current[r].top +
                        calculatedHeights.current[r].height;

                do {
                    r++;
                    const height = rowHeight({ rowIndex: r, rowData: dataRef.current[r] });
                    calculatedHeights.current.push({
                        height,
                        top: lastBottom,
                    });
                    lastBottom += height;
                } while (lastBottom <= top && r < calculatedHeights.current.length - 1);
            }

            return r;
        },
        // Disabling exhaustive-deps here because of the dataRef dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rowHeight, dataLength]
    );

    const getRowSize = useCallback(
        (index: number): RowSize => {
            if (typeof rowHeight === 'number') {
                return { height: rowHeight, top: rowHeight * index };
            }

            if (index >= dataLength) {
                return { height: 0, top: 0 };
            }

            if (index < calculatedHeights.current.length) {
                return calculatedHeights.current[index];
            }

            let lastBottom =
                calculatedHeights.current[calculatedHeights.current.length - 1].top +
                calculatedHeights.current[calculatedHeights.current.length - 1].height;

            for (let i = calculatedHeights.current.length; i <= index; i++) {
                const height = rowHeight({ rowIndex: i, rowData: dataRef.current[i] });

                calculatedHeights.current.push({ height, top: lastBottom });
                lastBottom += height;
            }

            return calculatedHeights.current[index];
        },
        // Disabling exhaustive-deps here because of the dataRef dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rowHeight, dataLength]
    );

    const getRowTotalSize = useCallback(
        (maxHeight: number): number => {
            if (typeof rowHeight === 'number') {
                return dataLength * rowHeight;
            }

            const index = getRowIndex(maxHeight);

            return (
                calculatedHeights.current[index].top +
                calculatedHeights.current[index].height
            );
        },
        [rowHeight, dataLength, getRowIndex]
    );

    return {
        getRowIndex,
        getRowSize,
        getRowTotalSize
    };
};
