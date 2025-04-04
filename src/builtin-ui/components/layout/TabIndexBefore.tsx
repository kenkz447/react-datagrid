import React from 'react';
import { useDatagridContext } from '../../../browser';

function TabIndexBeforeImp() {
    const { beforeTabIndexRef, columns, data, setActiveCell } = useDatagridContext();

    return (
        <div
            ref={beforeTabIndexRef}
            tabIndex={columns.length && data.length ? 0 : undefined}
            onFocus={(e) => {
                e.target.blur();
                setActiveCell({ col: 0, row: 0 });
            }}
        />
    );
}

export const TabIndexBefore = React.memo(TabIndexBeforeImp);
