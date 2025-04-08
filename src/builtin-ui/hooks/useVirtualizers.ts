import { defaultRangeExtractor, useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { RefObject, useEffect } from 'react';
import { RowData } from '../../core';

export interface UseVirtualizersProps {
    readonly data: any[];
    readonly outerRef: RefObject<HTMLDivElement>;
    readonly headerRowHeight: number;
    readonly columnWidths?: number[];
    readonly getRowSize: (index: number) => { readonly height: number; readonly top: number };
    readonly columns: any[];
    readonly hasStickyRightColumn: boolean;
    readonly rowKey?: string | ((props: { readonly rowData: any; readonly rowIndex: number }) => string | number);
}

export interface UseVirtualizersResult {
    readonly rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    readonly colVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

export function useVirtualizers<TRow extends RowData = RowData>(props: UseVirtualizersProps): UseVirtualizersResult {
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
                } else if (
                    typeof rowKey === 'string' &&
                    row instanceof Object && rowKey in (row as any)
                ) {
                    const key = row[rowKey as keyof TRow];
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
