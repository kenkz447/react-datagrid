import { useCallback } from 'react';
import { Cell, UseDatagridCoreReturn } from '../../core';
import { formatCopyData } from '../utils/copyPasting';
import { writeToClipboard } from '../utils/clipboard';

// Generate 2D array of data to be copied
export const generateCopyData = (
    activeCell: Cell,
    selection: { min: Cell; max: Cell } | null,
    columns: any[],
    data: any[]
): Array<Array<number | string | null>> => {
    const copyData: Array<Array<number | string | null>> = [];
    const min: Cell = selection?.min || activeCell;
    const max: Cell = selection?.max || activeCell;

    for (let row = min.row; row <= max.row; ++row) {
        copyData.push([]);

        for (let col = min.col; col <= max.col; ++col) {
            const { copyValue = () => null } = columns[col + 1];
            copyData[row - min.row].push(
                copyValue({ rowData: data[row], rowIndex: row })
            );
        }
    }
    
    return copyData;
};

type CopyHandlerProps =  Pick<UseDatagridCoreReturn, 'editing' | 'activeCell' | 'selection' | 'columns' | 'data'>;

export const useCopyHandler = ({
    editing,
    activeCell,
    selection,
    columns,
    data,
}: CopyHandlerProps) => {
    
    const onCopy = useCallback(
        async (event?: ClipboardEvent) => {
            if (!editing && activeCell) {
                const copyData = generateCopyData(activeCell, selection, columns, data);
                const { textPlain, textHtml } = formatCopyData(copyData);
                
                const success = await writeToClipboard(textPlain, textHtml, event);
                
                if (!success) {
                    alert(
                        'This action is unavailable in your browser, but you can still use Ctrl+C for copy or Ctrl+X for cut'
                    );
                }
            }
        },
        [activeCell, columns, data, editing, selection]
    );

    return onCopy;
};
