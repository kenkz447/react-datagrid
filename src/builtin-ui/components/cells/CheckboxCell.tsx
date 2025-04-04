import { useLayoutEffect, useRef } from 'react';
import { CellProps } from '../../../core';

export function CheckboxCell({ focus, rowData, setRowData, active, stopEditing, disabled }: CellProps<boolean, any>) {
    const ref = useRef<HTMLInputElement>(null);

    // When cell becomes focus we immediately toggle the checkbox and blur the cell by calling `stopEditing`
    // Notice the `nextRow: false` to make sure the active cell does not go to the cell below and stays on this cell
    // This way the user can keep pressing Enter to toggle the checkbox on and off multiple times
    useLayoutEffect(() => {
        if (focus) {
            setRowData(!rowData);
            stopEditing({ nextRow: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focus, stopEditing]);

    return (
        <input
            className="dsg-checkbox"
            // Important to prevent any undesired "tabbing"
            tabIndex={-1}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            checked={Boolean(rowData)}
            // When cell is not active, we allow the user to toggle the checkbox by clicking on it
            // When cell becomes active, we disable this feature and rely on focus instead (see `useLayoutEffect` above)
            onMouseDown={() => !active && setRowData(!rowData)}
            onChange={() => null} />
    );
};
