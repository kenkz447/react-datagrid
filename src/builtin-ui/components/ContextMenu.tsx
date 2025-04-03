import { ContextMenuItem, useDatagridContext } from '../../core';

function ContextMenuItemComponent({ item }: { item: ContextMenuItem; }) {
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
}

export function ContextMenu() {
    const {
        contextMenu,
        contextMenuItems,
        contextMenuRef,
    } = useDatagridContext();

    return (
        <div
            className="dsg-context-menu"
            style={{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }}
            ref={contextMenuRef}
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
