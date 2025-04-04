import React from 'react';
import { UseDatagridReturn } from '../../../browser';

type TabIndexBeforeProps = Pick<UseDatagridReturn,
    | 'beforeTabIndexRef'
    | 'columns'
    | 'data'
    | 'setActiveCell'>;

function TabIndexBeforeImp(props: TabIndexBeforeProps) {
    const { beforeTabIndexRef, columns, data, setActiveCell } = props;

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
