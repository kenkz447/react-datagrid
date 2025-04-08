import React from 'react';
import { UseDatagridReturn } from '../../../browser';

type TabIndexBeforeProps = Pick<UseDatagridReturn, 'columns' | 'data' | 'setActiveCell'>;

function TabIndexBeforeImp(props: TabIndexBeforeProps) {
    const { columns, data, setActiveCell } = props;

    return (
        <div
            tabIndex={columns.length && data.length ? 0 : undefined}
            onFocus={(e) => {
                e.target.blur();
                setActiveCell({ col: 0, row: 0 });
            }}
        />
    );
}

export const TabIndexBefore = React.memo(TabIndexBeforeImp);
