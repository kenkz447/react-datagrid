import { defaultRangeExtractor, useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { RefObject, useEffect } from 'react';
import { RowData, RowKey } from '../../core';

export interface UseVirtualizersProps<TRow extends RowData = RowData> {
    readonly data: TRow[];
    readonly outerRef: RefObject<HTMLElement>;
    readonly headerRowHeight: number;
    readonly columnWidths?: number[];
    readonly getRowSize: (index: number) => { readonly height: number; readonly top: number };
    readonly columns: any[];
    readonly hasStickyRightColumn: boolean;
    readonly rowKey?: RowKey<TRow>;
}

export interface UseVirtualizersResult {
    readonly rowVirtualizer: Virtualizer<HTMLElement, Element>;
    readonly colVirtualizer: Virtualizer<HTMLElement, Element>;
}

export function useVirtualizers<TRow extends RowData = RowData>(props: UseVirtualizersProps<TRow>): UseVirtualizersResult {
    const {
        data,
        outerRef,
        headerRowHeight,
        columnWidths,
        getRowSize,
        columns,
        hasStickyRightColumn,
        rowKey
    } = props;

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => outerRef.current,
        paddingStart: headerRowHeight,
        estimateSize: (index) => getRowSize(index).height,
        getItemKey: (index: number): React.Key => {
            if (rowKey && index > 0) {
                const row = data[index - 1];
                if (typeof rowKey === 'function') {
                    return rowKey({ rowData: row, rowIndex: index });
                }

                if (typeof rowKey === 'string' && row instanceof Object && rowKey in row) {
                    const key = row[rowKey];
                    if (typeof key === 'string' || typeof key === 'number') {
                        return key;
                    }
                }
            }
            return index;
        },
        overscan: 5,
    });

    const colVirtualizer = useVirtualizer({
        count: columns.length,
        getScrollElement: () => outerRef.current,
        estimateSize: (index) => columnWidths?.[index] ?? 100,
        horizontal: true,
        getItemKey: (index: number): React.Key => columns[index].id ?? index,
        overscan: 1,
        rangeExtractor: (range) => {
            const result = defaultRangeExtractor(range);
            if (result[0] !== 0) {
                result.unshift(0);
            }
            if (
                hasStickyRightColumn &&
                result[result.length - 1] !== columns.length - 1
            ) {
                result.push(columns.length - 1);
            }
            return result;
        },
    });

    useEffect(() => {
        colVirtualizer.measure();
    }, [colVirtualizer, columnWidths]);

    return { rowVirtualizer, colVirtualizer };
}
