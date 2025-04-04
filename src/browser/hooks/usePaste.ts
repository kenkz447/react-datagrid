import { useCallback, useRef } from 'react';
import { parseTextHtmlData, parseTextPlainData } from '../utils/copyPasting';
import { UseDatagridCoreReturn } from '../../core';

export const usePasteHandler = ({
    activeCell,
    editing,
    applyPasteDataToDatasheet,
}: UseDatagridCoreReturn) => {

    const activeCellRef = useRef(activeCell);
    activeCellRef.current = activeCell;

    const onPaste = useCallback(
        (event: ClipboardEvent) => {
            if (activeCellRef.current && !editing) {
                let pasteData = [['']];
                if (event.clipboardData?.types.includes('text/html')) {
                    pasteData = parseTextHtmlData(
                        event.clipboardData?.getData('text/html')
                    );
                } else if (event.clipboardData?.types.includes('text/plain')) {
                    pasteData = parseTextPlainData(
                        event.clipboardData?.getData('text/plain')
                    );
                } else if (event.clipboardData?.types.includes('text')) {
                    pasteData = parseTextPlainData(
                        event.clipboardData?.getData('text')
                    );
                }
                applyPasteDataToDatasheet(pasteData);
                event.preventDefault();
            }
        },
        [applyPasteDataToDatasheet, editing]
    );

    return onPaste;
};
