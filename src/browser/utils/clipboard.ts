import { parseTextHtmlData, parseTextPlainData } from './copyPasting';

export const readClipboard = async (): Promise<string[][]> => {
    if (navigator.clipboard.read !== undefined) {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                let pasteData = [['']];

                if (item.types.includes('text/html')) {
                    const htmlTextData = await item.getType('text/html');
                    pasteData = parseTextHtmlData(await htmlTextData.text());
                    return pasteData;
                } else if (item.types.includes('text/plain')) {
                    const plainTextData = await item.getType('text/plain');
                    pasteData = parseTextPlainData(await plainTextData.text());
                    return pasteData;
                } else if (item.types.includes('text')) {
                    const htmlTextData = await item.getType('text');
                    pasteData = parseTextHtmlData(await htmlTextData.text());
                    return pasteData;
                }

                return pasteData;
            }
        } catch (error) {
            console.error('Failed to read clipboard contents', error);
        }
    } else if (navigator.clipboard.readText !== undefined) {
        try {
            const text = await navigator.clipboard.readText();
            return parseTextPlainData(text);
        } catch (error) {
            console.error('Failed to read clipboard text', error);
        }
    }

    return [['']];
};

// Handle clipboard operations
export const writeToClipboard = async (
    textPlain: string,
    textHtml: string,
    event?: ClipboardEvent
): Promise<boolean> => {
    if (event !== undefined) {
        event.clipboardData?.setData('text/plain', textPlain);
        event.clipboardData?.setData('text/html', textHtml);
        event.preventDefault();
        return true;
    }

    try {
        if (navigator.clipboard.write !== undefined) {
            const textBlob = new Blob([textPlain], { type: 'text/plain' });
            const htmlBlob = new Blob([textHtml], { type: 'text/html' });
            const clipboardData = [
                new ClipboardItem({
                    'text/plain': textBlob,
                    'text/html': htmlBlob,
                }),
            ];
            await navigator.clipboard.write(clipboardData);
            return true;
        } else if (navigator.clipboard.writeText !== undefined) {
            await navigator.clipboard.writeText(textPlain);
            return true;
        } else if (document.execCommand !== undefined) {
            return document.execCommand('copy');
        }
        return false;
    } catch (error) {
        console.error('Failed to write to clipboard:', error);
        return false;
    }
};
