import { useCallback } from 'react';
import { Cell } from '../../../core';
import { encodeHtml } from '../../utils/copyPasting';

interface UseCopyHandlerProps {
    editing,
    activeCell,
    selection,
    columns,
    data,
}

export const useCopyHandler = (props: UseCopyHandlerProps) => {
    const {
        editing,
        activeCell,
        selection,
        columns,
        data,
    } = props;

    const onCopy = useCallback(
        async (event?: ClipboardEvent) => {
            if (!editing && activeCell) {
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

                const textPlain = copyData.map((row) => row.join('\t')).join('\n');
                const textHtml = `<table>${copyData
                    .map(
                        (row) =>
                            `<tr>${row
                                .map(
                                    (cell) =>
                                        `<td>${encodeHtml(String(cell ?? '')).replace(
                                            /\n/g,
                                            '<br/>'
                                        )}</td>`
                                )
                                .join('')}</tr>`
                    )
                    .join('')}</table>`;

                if (event !== undefined) {
                    event.clipboardData?.setData('text/plain', textPlain);
                    event.clipboardData?.setData('text/html', textHtml);
                    event.preventDefault();
                    return;
                }

                let success = false;
                if (navigator.clipboard.write !== undefined) {
                    const textBlob = new Blob([textPlain], {
                        type: 'text/plain',
                    });
                    const htmlBlob = new Blob([textHtml], { type: 'text/html' });
                    const clipboardData = [
                        new ClipboardItem({
                            'text/plain': textBlob,
                            'text/html': htmlBlob,
                        }),
                    ];
                    await navigator.clipboard.write(clipboardData).then(() => {
                        success = true;
                    });
                } else if (navigator.clipboard.writeText !== undefined) {
                    await navigator.clipboard.writeText(textPlain).then(() => {
                        success = true;
                    });
                } else if (document.execCommand !== undefined) {
                    const result = document.execCommand('copy');
                    if (result) {
                        success = true;
                    }
                }
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
