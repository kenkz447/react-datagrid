import { useCallback, useRef } from 'react';
import { CellProps, RowData } from '../types';

export function CellWrapper({ columnData: { key, original }, rowData, setRowData, ...rest }: CellProps<RowData, any>) {
    // We use a ref so useCallback does not produce a new setKeyData function every time the rowData changes
    const rowDataRef = useRef(rowData);
    rowDataRef.current = rowData;

    // We wrap the setRowData function to assign the value to the desired key
    const setKeyData = useCallback(
        (value: any) => {
            setRowData({ ...rowDataRef.current, [key]: value });
        },
        [key, setRowData]
    );

    const Component = original.component;

    if (!Component) {
        return null;
    }

    return (
        <Component
            columnData={original.columnData}
            setRowData={setKeyData}
            // We only pass the value of the desired key, this is why each cell does not have to re-render everytime
            // another cell in the same row changes!
            rowData={rowData[key]}
            {...rest}
        />
    );
}
