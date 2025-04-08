import cx from 'classnames';
import { Cell } from './Cell';
import { VirtualItem } from '@tanstack/react-virtual';

export interface HeaderCellProps {
    readonly col: VirtualItem;
    readonly columns: any[];
    readonly hasStickyRightColumn: boolean;
    readonly selectionColMin?: number;
    readonly selectionColMax?: number;
}

export function HeaderCell({
    col,
    columns,
    hasStickyRightColumn,
    selectionColMin,
    selectionColMax
}: HeaderCellProps) {
    return (
        <Cell
            gutter={col.index === 0}
            stickyRight={hasStickyRightColumn && col.index === columns.length - 1}
            width={col.size}
            left={col.start}
            className={cx(
                'dsg-cell-header',
                selectionColMin !== undefined &&
                selectionColMax !== undefined &&
                selectionColMin <= col.index - 1 &&
                selectionColMax >= col.index - 1 &&
                'dsg-cell-header-active',
                columns[col.index].headerClassName
            )}
        >
            <div className="dsg-cell-header-container">
                {columns[col.index].title}
            </div>
        </Cell>
    );
}
