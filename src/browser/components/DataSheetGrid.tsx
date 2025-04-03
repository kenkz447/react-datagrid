import type {
    Cell,
    DataSheetGridProps,
    RowData
} from '../../core';
import { Grid } from './Grid';
import { SelectionRect } from './SelectionRect';
import { DatagridProvider, useDatagridContext } from '../../core';
import { useEffect, useRef, useState } from 'react';
import { useMouseDownHandler } from '../hooks/events/useMouseDownHandler';
import { useKeydownHandler } from '../hooks/events/useKeydownHandler';
import { useMouseMoveHandler } from '../hooks/events/useMouseMoveHandler';
import { useMouseUpHandler } from '../hooks/events/useMouseUpHandler';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { useCallbacks } from '../hooks/useCallbacks';
import { usePasteHandler } from '../hooks/events/usePasteHandler';
import { useCopyHandler } from '../hooks/events/useCopyHandler';
import { useCutHandler } from '../hooks/events/useCutHandler';
import { useUI } from '../hooks/useUI';
import { getAllTabbableElements } from '../utils/tab';
import { AddRows } from './AddRows';
import { ContextMenu } from './ContextMenu';

function DataSheetGridImpl<T extends RowData>() {
    const context = useDatagridContext<T>();

    const beforeTabIndexRef = useRef<HTMLDivElement>(null);
    const afterTabIndexRef = useRef<HTMLDivElement>(null);

    const {
        className,
        style,
        addRowsComponent: AddRowsComponent = AddRows,
        contextMenuComponent: ContextMenuComponent = ContextMenu,
        lockRows,
        disableContextMenu
    } = context.propsRef.current;

    const {
        setActiveCell,
        hasStickyRightColumn,
        columns,
        activeCell,
        selectionCell,
        data,
    } = context;

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cursorIndex: Cell } | null>(null);

    const {
        innerRef,
        outerRef,
        width,
        height,
        displayHeight,
        contentWidth,
        columnWidths,
        columnRights,
        isFullWidth,
        scrollTo,
        getCursorIndex
    } = useUI();

    const onPaste = usePasteHandler();

    const onCopy = useCopyHandler();

    const onCut = useCutHandler({ onCopy });

    const onMouseDown = useMouseDownHandler({
        innerRef,
        getCursorIndex,
        contextMenu,
        setContextMenu,
        disableContextMenu: disableContextMenu || lockRows,
    });

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


    useDocumentEventListener('paste', onPaste);
    useDocumentEventListener('copy', onCopy);
    useDocumentEventListener('cut', onCut);
    useDocumentEventListener('mouseup', onMouseUp);
    useDocumentEventListener('mousedown', onMouseDown);
    useDocumentEventListener('mousemove', onMouseMove);
    useDocumentEventListener('keydown', onKeyDown);

    useCallbacks();

    // Scroll to the selectionCell cell when it changes
    useEffect(() => {
        if (selectionCell) {
            scrollTo(selectionCell);
        }
    }, [selectionCell, scrollTo]);

    // Scroll to the active cell when it changes
    useEffect(() => {
        if (activeCell) {
            scrollTo(activeCell);
        }
    }, [activeCell, scrollTo]);

    // Blur any element on focusing the grid
    useEffect(() => {
        if (activeCell !== null) {
            (document.activeElement as HTMLElement).blur();
            window.getSelection()?.removeAllRanges();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCell !== null]);

    const rawColumns = context.propsRef.current.columns;

    return (
        <div className={className} style={style}>
            <div
                ref={beforeTabIndexRef}
                tabIndex={rawColumns.length && data.length ? 0 : undefined}
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
                tabIndex={rawColumns.length && data.length ? 0 : undefined}
                onFocus={(e) => {
                    e.target.blur();
                    setActiveCell({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: data.length - 1,
                    });
                }}
            />
            {!lockRows && (<AddRowsComponent />)}
            {contextMenu && (
                <ContextMenuComponent
                    clientX={contextMenu.x}
                    clientY={contextMenu.y}
                    cursorIndex={contextMenu.cursorIndex}
                    close={() => setContextMenu(null)}
                    onCut={onCut}
                    onCopy={onCopy}
                    innerRef={innerRef}
                    getCursorIndex={getCursorIndex}
                />
            )}
        </div>
    );
};

export function DataSheetGrid<TRow extends RowData>(props: Partial<DataSheetGridProps<TRow>>) {
    return (
        <DatagridProvider {...props}>
            <DataSheetGridImpl />
        </DatagridProvider>
    );
};
