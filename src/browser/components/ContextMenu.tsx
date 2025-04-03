import * as React from 'react';
import { useCallback, useRef } from 'react';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { ContextMenuItem, useDatagridContext } from '../../core';
import { parseTextHtmlData, parseTextPlainData } from '../utils/copyPasting';
import { useContextMenuHandler } from '../hooks/events/useContextMenuHandler';

const defaultRenderItem = (item: ContextMenuItem) => {
    if (item.type === 'CUT') {
        return <>Cut</>;
    }

    if (item.type === 'COPY') {
        return <>Copy</>;
    }

    if (item.type === 'PASTE') {
        return <>Paste</>;
    }

    if (item.type === 'DELETE_ROW') {
        return <>Delete row</>;
    }

    if (item.type === 'DELETE_ROWS') {
        return (
            <>
                Delete rows <b>{item.fromRow}</b> to <b>{item.toRow}</b>
            </>
        );
    }

    if (item.type === 'INSERT_ROW_BELLOW') {
        return <>Insert row below</>;
    }

    if (item.type === 'DUPLICATE_ROW') {
        return <>Duplicate row</>;
    }

    if (item.type === 'DUPLICATE_ROWS') {
        return (
            <>
                Duplicate rows <b>{item.fromRow}</b> to <b>{item.toRow}</b>
            </>
        );
    }

    return item.type;
};

interface ContextMenuProps {
    clientX,
    clientY,
    close,
    onCut,
    onCopy,
    innerRef,
    getCursorIndex
}

export function ContextMenu({
    clientX,
    clientY,
    close,
    onCut,
    onCopy,
    innerRef,
    getCursorIndex
}: ContextMenuProps) {
    const {
        activeCell,
        selection,
        applyPasteDataToDatasheet,
        duplicateRows,
        deleteRows,
        insertRowAfter
    } = useDatagridContext();

    const [contextMenuItems, setContextMenuItems] = React.useState<ContextMenuItem[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    const onClickOutside = useCallback(
        (event: MouseEvent) => {
            const clickInside = containerRef.current?.contains(event.target as Node);

            if (!clickInside) {
                close();
            }
        },
        [close]
    );

    const onContextMenu = useContextMenuHandler({
        innerRef,
        getCursorIndex
    });

    useDocumentEventListener('mousedown', onClickOutside);
    useDocumentEventListener('contextmenu', onContextMenu);

    React.useEffect(() => {
        const items: ContextMenuItem[] = [];

        if (activeCell?.row !== undefined) {
            items.push(
                {
                    type: 'COPY',
                    action: (): void => {
                        onCopy();
                        close(null);
                    },
                },
                {
                    type: 'CUT',
                    action: (): void => {
                        onCut();
                        close(null);
                    },
                },
                {
                    type: 'PASTE',
                    action: async (): Promise<void> => {
                        if (navigator.clipboard.read !== undefined) {
                            const items = await navigator.clipboard.read();
                            items.forEach(async (item) => {
                                let pasteData = [['']];
                                if (item.types.includes('text/html')) {
                                    const htmlTextData = await item.getType('text/html');
                                    pasteData = parseTextHtmlData(await htmlTextData.text());
                                } else if (item.types.includes('text/plain')) {
                                    const plainTextData = await item.getType('text/plain');
                                    pasteData = parseTextPlainData(await plainTextData.text());
                                } else if (item.types.includes('text')) {
                                    const htmlTextData = await item.getType('text');
                                    pasteData = parseTextHtmlData(await htmlTextData.text());
                                }
                                applyPasteDataToDatasheet(pasteData);
                            });
                        } else if (navigator.clipboard.readText !== undefined) {
                            const text = await navigator.clipboard.readText();
                            applyPasteDataToDatasheet(parseTextPlainData(text));
                        } else {
                            alert(
                                'This action is unavailable in your browser, but you can still use Ctrl+V for paste'
                            );
                        }
                        close(null);
                    },
                }
            );
        }

        if (selection?.max.row !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    close(null);
                    insertRowAfter(selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    close(null);
                    insertRowAfter(activeCell.row);
                },
            });
        }

        if (
            selection?.min.row !== undefined &&
            selection.min.row !== selection.max.row
        ) {
            items.push({
                type: 'DUPLICATE_ROWS',
                fromRow: selection.min.row + 1,
                toRow: selection.max.row + 1,
                action: () => {
                    close(null);
                    duplicateRows(selection.min.row, selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DUPLICATE_ROW',
                action: () => {
                    close(null);
                    duplicateRows(activeCell.row);
                },
            });
        }

        if (
            selection?.min.row !== undefined &&
            selection.min.row !== selection.max.row
        ) {
            items.push({
                type: 'DELETE_ROWS',
                fromRow: selection.min.row + 1,
                toRow: selection.max.row + 1,
                action: () => {
                    close(null);
                    deleteRows(selection.min.row, selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DELETE_ROW',
                action: () => {
                    close(null);
                    deleteRows(activeCell.row);
                },
            });
        }

        setContextMenuItems(items);
        if (!items.length) {
            close(null);
        }
    }, [
        selection,
        activeCell,
        deleteRows,
        duplicateRows,
        insertRowAfter,
        onCut,
        onCopy,
        applyPasteDataToDatasheet,
        close,
        setContextMenuItems,
    ]);


    return (
        <div
            className="dsg-context-menu"
            style={{ left: clientX + 'px', top: clientY + 'px' }}
            ref={containerRef}
        >
            {contextMenuItems.map((item) => (
                <div
                    key={item.type}
                    onClick={item.action}
                    className="dsg-context-menu-item"
                >
                    {defaultRenderItem(item)}
                </div>
            ))}
        </div>
    );
};
