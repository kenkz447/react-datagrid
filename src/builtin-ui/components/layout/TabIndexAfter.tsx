import React from 'react';
import { useDatagridContext } from '../../../browser';

export function TabIndexAfterImpl() {
    const { afterTabIndexRef, columns, data, setActiveCell, hasStickyRightColumn } = useDatagridContext();

    return (
        <div
            ref={afterTabIndexRef}
            tabIndex={columns.length && data.length ? 0 : undefined}
            onFocus={(e) => {
                e.target.blur();
                setActiveCell({
                    col: columns.length - (hasStickyRightColumn ? 3 : 2),
                    row: data.length - 1,
                });
            }}
        />
    );
}

export const TabIndexAfter = React.memo(TabIndexAfterImpl);
