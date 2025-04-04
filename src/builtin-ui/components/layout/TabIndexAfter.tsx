import React from 'react';
import { UseDatagridReturn } from '../../../browser';

type TabIndexAfterProps = Pick<UseDatagridReturn,
    | 'afterTabIndexRef'
    | 'columns'
    | 'data'
    | 'setActiveCell'
    | 'hasStickyRightColumn'>;

export function TabIndexAfterImpl(props: TabIndexAfterProps) {
    const { afterTabIndexRef, columns, data, setActiveCell, hasStickyRightColumn } = props;

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
