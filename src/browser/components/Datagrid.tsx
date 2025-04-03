import type {
    RowData
} from '../../core';
import { Grid } from './Grid';
import { SelectionRect } from './SelectionRect';
import { useDatagridContext } from '../../core';
import { useKeydownHandler } from '../hooks/events/useKeydownHandler';
import { useMouseDownHandler } from '../hooks/events/useMouseDownHandler';
import { useMouseMoveHandler } from '../hooks/events/useMouseMoveHandler';
import { useMouseUpHandler } from '../hooks/events/useMouseUpHandler';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { getAllTabbableElements } from '../utils/tab';
import { useCallback } from 'react';
import { useContextMenuHandler } from '../hooks/events/useContextMenuHandler';

export function Datagrid<TRow extends RowData>() {
    const {
        propsRef,
        data,
        columns,
        outerRef,
        innerRef,
        beforeTabIndexRef,
        afterTabIndexRef,
        width,
        height,
        displayHeight,
        contentWidth,
        columnWidths,
        columnRights,
        isFullWidth,
        setActiveCell,
        getCursorIndex,
        hasStickyRightColumn,
        paste,
        cut,
        copy,
        contextMenuRef,
        closeContextMenu,
    } = useDatagridContext<TRow>();

    const {
        className,
        style,
    } = propsRef.current;

    const onMouseDown = useMouseDownHandler();
    const onMouseUp = useMouseUpHandler();
    const onMouseMove = useMouseMoveHandler({
        scrollTo,
        getCursorIndex,
    });

    const onKeyDown = useKeydownHandler({
        scrollTo,
        onFocusOutside: (direction) => {
            if (direction === 'top') {
                const allElements = getAllTabbableElements();
                const index = allElements.indexOf(beforeTabIndexRef.current);
                allElements[(index - 1 + allElements.length) % allElements.length].focus();
            } else {
                const allElements = getAllTabbableElements();
                const index = allElements.indexOf(afterTabIndexRef.current);
                allElements[(index + 1) % allElements.length].focus();
            }
        }
    });

    const onClickOutside = useCallback(
        (event: MouseEvent) => {
            const clickInside = contextMenuRef.current?.contains(event.target as Node);

            if (!clickInside) {
                close();
            }
        },
        [closeContextMenu]
    );

    const onContextMenu = useContextMenuHandler();

    useDocumentEventListener('mousedown', onClickOutside);
    useDocumentEventListener('contextmenu', onContextMenu);

    useDocumentEventListener('paste', paste);
    useDocumentEventListener('copy', copy);
    useDocumentEventListener('cut', cut);
    useDocumentEventListener('mouseup', onMouseUp);
    useDocumentEventListener('mousedown', onMouseDown);
    useDocumentEventListener('mousemove', onMouseMove);
    useDocumentEventListener('keydown', onKeyDown);

    return (
        <div className={className} style={style}>
            <div
                ref={beforeTabIndexRef}
                tabIndex={columns.length && data.length ? 0 : undefined}
                onFocus={(e) => {
                    e.target.blur();
                    setActiveCell({ col: 0, row: 0 });
                }}
            />
            <Grid
                outerRef={outerRef}
                columnWidths={columnWidths}
                displayHeight={displayHeight}
                isFullWidth={isFullWidth}
                innerRef={innerRef}
            >
                <SelectionRect
                    outerRef={outerRef}
                    columnRights={columnRights}
                    columnWidths={columnWidths}
                    viewHeight={height}
                    viewWidth={width}
                    contentWidth={isFullWidth ? undefined : contentWidth}
                />
            </Grid>
            <div
                ref={afterTabIndexRef}
                tabIndex={columns.length && data.length ? 0 : undefined}
                onFocus={(e) => {
                    e.target.blur();
                    setActiveCell({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: data.length - 1,
                    });
                }}
            />
        </div>
    );
};
