import cx from 'classnames';
import { HeaderCell } from './HeaderCell';
import { useDatagridContext } from '../../../browser';
import React from 'react';


function HeaderRowImpl() {
    const {
        headerRowHeight,
        columns,
        isFullWidth,
        hasStickyRightColumn,
        selection,
        activeCell,
        colVirtualizer
    } = useDatagridContext();

    const selectionColMin = selection?.min.col ?? activeCell?.col;
    const selectionColMax = selection?.max.col ?? activeCell?.col;

    if (headerRowHeight <= 0) return null;

    return (
        <div
            className={cx('dsg-row', 'dsg-row-header')}
            style={{
                width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
                height: headerRowHeight,
            }}
        >
            {colVirtualizer.getVirtualItems().map((col) => (
                <HeaderCell
                    key={col.key}
                    col={col}
                    columns={columns}
                    hasStickyRightColumn={hasStickyRightColumn}
                    selectionColMin={selectionColMin}
                    selectionColMax={selectionColMax}
                />
            ))}
        </div>
    );
}

export const HeaderRow = React.memo(HeaderRowImpl);
