import { useCallback, useRef } from 'react';
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

export const useCopyHandler = ({
    activeCell,
    selection,
    editing,
    columns,
    data,
}: UseDatagridCoreReturn) => {

    const activeCellRef = useRef(activeCell);
    activeCellRef.current = activeCell;

    const selectionRef = useRef(selection);
    selectionRef.current = selection;

    const onCopy = useCallback(
        async (event?: ClipboardEvent) => {
            if (!editing && activeCellRef.current) {
                const copyData = generateCopyData(activeCellRef.current, selectionRef.current, columns, data);
                const { textPlain, textHtml } = formatCopyData(copyData);

                const success = await writeToClipboard(textPlain, textHtml, event);

                if (!success) {
                    alert(
                        'This action is unavailable in your browser, but you can still use Ctrl+C for copy or Ctrl+X for cut'
                    );
                }
            }
        },
        [columns, data, editing]
    );

    return onCopy;
};
