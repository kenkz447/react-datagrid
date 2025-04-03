import { useCallback, useState } from 'react';
import { useDatagridContext } from '../../core';

export function AddRows() {
    const { insertRowAfter, data } = useDatagridContext();

    const [value, setValue] = useState<number>(1);
    const [rawValue, setRawValue] = useState<string>(String(value));

    const addRows = useCallback((count: number) => {
        insertRowAfter(data.length - 1, count);
    }, [data, insertRowAfter]);

    return (
        <div className="dsg-add-row">
            <button
                type="button"
                className="dsg-add-row-btn"
                onClick={() => addRows(value)}
            >
                Add
            </button>{' '}
            <input
                className="dsg-add-row-input"
                value={rawValue}
                onBlur={() => setRawValue(String(value))}
                type="number"
                min={1}
                onChange={(e) => {
                    setRawValue(e.target.value);
                    setValue(Math.max(1, Math.round(parseInt(e.target.value) || 0)));
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        addRows(value);
                    }
                }}
            />{' '}
            <span>rows</span>
        </div>
    );
}
