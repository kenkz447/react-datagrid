import { useCallback } from 'react';
import { parseTextHtmlData, parseTextPlainData } from '../../utils/copyPasting';

interface UsePasteHandlerProps {
    activeCell,
    editing,
    applyPasteDataToDatasheet,
}

export const usePasteHandler = (props: UsePasteHandlerProps) => {
    const {
        activeCell,
        editing,
        applyPasteDataToDatasheet,
    } = props;

    const onPaste = useCallback(
        (event: ClipboardEvent) => {
            if (activeCell && !editing) {
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
        [activeCell, applyPasteDataToDatasheet, editing]
    );

    return onPaste;
};
