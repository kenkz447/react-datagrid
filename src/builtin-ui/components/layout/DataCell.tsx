import { Cell } from './Cell';
import { RowData } from '../../../core';
import { useDatagridContext } from '../../../browser';
import { memo } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';

export interface DataCellProps {
    readonly col: VirtualItem;
    readonly row: VirtualItem;
    readonly disabled: boolean;
    readonly rowActive: boolean;
}

function DataCellImpl<TRow extends RowData = RowData>({
    col,
    row,
    disabled,
    rowActive,
}: DataCellProps) {
    const {
        columns,
        data,
        editing,
        hasStickyRightColumn,
        activeCell,
        stopEditing,
        deleteGivenRow,
        duplicateGivenRow,
        insertAfterGivenRow,
        setGivenRowData
    } = useDatagridContext<TRow>();

    const Component = columns[col.index].component;
    const cellIsActive = activeCell?.row === row.index && activeCell.col === col.index - 1;

    return (
        <Cell
            key={col.key}
            gutter={col.index === 0}
            stickyRight={hasStickyRightColumn && col.index === columns.length - 1}
            active={col.index === 0 && rowActive}
            disabled={disabled}
            width={col.size}
            left={col.start}
        >
            <Component
                rowData={data[row.index]}
                disabled={disabled}
                active={cellIsActive}
                columnIndex={col.index - 1}
                rowIndex={row.index}
                focus={cellIsActive && editing}
                deleteRow={deleteGivenRow(row.index)}
                duplicateRow={duplicateGivenRow(row.index)}
                insertRowBelow={insertAfterGivenRow(row.index)}
                setRowData={setGivenRowData(row.index)}
                stopEditing={stopEditing}
                columnData={columns[col.index].columnData}
            />
        </Cell>
    );
}

export const DataCell = memo(DataCellImpl);
