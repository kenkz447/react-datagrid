import cx from 'classnames';
import { HeaderCell } from './HeaderCell';

export interface HeaderRowProps {
    readonly headerRowHeight: number;
    readonly colVirtualizer: any;
    readonly columns: any[];
    readonly isFullWidth?: boolean;
    readonly hasStickyRightColumn: boolean;
    readonly selectionColMin?: number;
    readonly selectionColMax?: number;
}

export function HeaderRow({
    headerRowHeight,
    colVirtualizer,
    columns,
    isFullWidth,
    hasStickyRightColumn,
    selectionColMin,
    selectionColMax
}: HeaderRowProps) {
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
