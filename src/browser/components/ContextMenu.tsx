import * as React from 'react';
import { useCallback, useRef } from 'react';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { Cell, ContextMenuItem, useDatagridContext } from '../../core';
import { useContextMenuHandler } from '../hooks/events/useContextMenuHandler';
import { useContextMenuItems } from '../hooks/useContextMenuItems';

const ContextMenuItemComponent = ({ item }: { item: ContextMenuItem }) => {
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

    return <>{item.type}</>;
};

interface ContextMenuProps {
    clientX: number;
    clientY: number;
    close: (event?: React.MouseEvent | null) => void;
    onCut: () => void;
    onCopy: () => void;
    innerRef: React.RefObject<HTMLDivElement>;
    getCursorIndex: (event: MouseEvent, force?: boolean, includeSticky?: boolean) => Cell | null;
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

    const contextMenuItems = useContextMenuItems(
        activeCell, 
        selection,
        {
            onCut,
            onCopy,
            applyPasteDataToDatasheet,
            duplicateRows,
            deleteRows,
            insertRowAfter,
            close
        }
    );

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
                    <ContextMenuItemComponent item={item} />
                </div>
            ))}
        </div>
    );
};
