import type {
    Cell,
    ContextMenuItem,
    DataSheetGridProps,
    RowData
} from '../../core';
import { AddRows } from './AddRows';
import { ContextMenu } from './ContextMenu';
import { Grid } from './Grid';
import { SelectionRect } from './SelectionRect';
import { DatagridProvider, useDatagridContext } from '../../core';
import { useEffect, useRef } from 'react';
import { useMouseDownHandler } from '../hooks/events/useMouseDownHandler';
import { useContextMenuHandler } from '../hooks/events/useContextMenuHandler';
import { useKeydownHandler } from '../hooks/events/useKeydownHandler';
import { useMouseMoveHandler } from '../hooks/events/useMouseMoveHandler';
import { useMouseUpHandler } from '../hooks/events/useMouseUpHandler';
import { useDocumentEventListener } from '../hooks/useDocumentEventListener';
import { useCallbacks } from '../hooks/useCallbacks';
import { parseTextHtmlData, parseTextPlainData } from '../utils/copyPasting';
import { usePasteHandler } from '../hooks/events/usePasteHandler';
import { useCopyHandler } from '../hooks/events/useCopyHandler';
import { useCutHandler } from '../hooks/events/useCutHandler';
import { useEdges } from '../hooks/useEdges';
import { useUI } from '../hooks/useUI';
import { useContextMenu } from '../hooks/useContextMenu';

function DataSheetGridImpl<T extends RowData>() {
    const context = useDatagridContext<T>();

    const lastEditingCellRef = useRef<Cell>(null);
    const beforeTabIndexRef = useRef<HTMLDivElement>(null);
    const afterTabIndexRef = useRef<HTMLDivElement>(null);

    const {
        className,
        style,
        rowKey,
        rowClassName,
        cellClassName,
        onScroll,
        addRowsComponent: AddRowsComponent = AddRows,
        contextMenuComponent: ContextMenuComponent = ContextMenu,
        lockRows,
        headerRowHeight
    } = context.propsRef.current;

    const {
        setActiveCell,
        hasStickyRightColumn,
        columns,
        activeCell,
        selection,
        editing,
        isCellDisabled,
        selectionCell,
        expandSelection,
        data,
        applyPasteDataToDatasheet,
        duplicateRows,
        deleteRows,
        insertRowAfter,
        setRowData,
        stopEditing,
    } = context;

    const {
        contextMenu,
        setContextMenu,
        contextMenuItems,
        getContextMenuItems,
        disableContextMenu,
        setContextMenuItems,
    } = useContextMenu();

    const {
        outerRef,
        width,
        height,
        displayHeight,
        contentWidth,
        columnWidths,
        columnRights,
        getRowSize,
        fullWidth,
        innerRef,
        scrollTo,
        getCursorIndex
    } = useUI();

    const onPaste = usePasteHandler();

    const onCopy = useCopyHandler();

    const onCut = useCutHandler({ onCopy });

    const onMouseDown = useMouseDownHandler({
        contextMenu,
        contextMenuItems,
        setContextMenu,
        lastEditingCellRef,
        disableContextMenu,
        innerRef,
        getCursorIndex,
    });

    const onMouseUp = useMouseUpHandler();
    const onMouseMove = useMouseMoveHandler({
        scrollTo,
        getCursorIndex,
    });

    const onKeyDown = useKeydownHandler({
        scrollTo,
        beforeTabIndexRef,
        afterTabIndexRef,
        lastEditingCellRef
    });

    const onContextMenu = useContextMenuHandler({
        innerRef,
        getCursorIndex,
        activeCell,
        editing
    });

    useDocumentEventListener('paste', onPaste);
    useDocumentEventListener('copy', onCopy);
    useDocumentEventListener('cut', onCut);
    useDocumentEventListener('mouseup', onMouseUp);
    useDocumentEventListener('mousedown', onMouseDown);
    useDocumentEventListener('mousemove', onMouseMove);
    useDocumentEventListener('keydown', onKeyDown);
    useDocumentEventListener('contextmenu', onContextMenu);

    useCallbacks({ lastEditingCellRef });

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

    useEffect(() => {
        const items: ContextMenuItem[] = [];

        if (activeCell?.row !== undefined) {
            items.push(
                {
                    type: 'COPY',
                    action: (): void => {
                        onCopy();
                        setContextMenu(null);
                    },
                },
                {
                    type: 'CUT',
                    action: (): void => {
                        onCut();
                        setContextMenu(null);
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
                        setContextMenu(null);
                    },
                }
            );
        }

        if (selection?.max.row !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    setContextMenu(null);
                    insertRowAfter(selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    setContextMenu(null);
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
                    setContextMenu(null);
                    duplicateRows(selection.min.row, selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DUPLICATE_ROW',
                action: () => {
                    setContextMenu(null);
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
                    setContextMenu(null);
                    deleteRows(selection.min.row, selection.max.row);
                },
            });
        } else if (activeCell?.row !== undefined) {
            items.push({
                type: 'DELETE_ROW',
                action: () => {
                    setContextMenu(null);
                    deleteRows(activeCell.row);
                },
            });
        }

        setContextMenuItems(items);
        if (!items.length) {
            setContextMenu(null);
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
        setContextMenu,
        setContextMenuItems,
    ]);

    const edges = useEdges(outerRef, width, height);
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
                columns={columns}
                outerRef={outerRef}
                columnWidths={columnWidths}
                hasStickyRightColumn={hasStickyRightColumn}
                displayHeight={displayHeight}
                data={data}
                fullWidth={fullWidth}
                headerRowHeight={headerRowHeight}
                activeCell={activeCell}
                innerRef={innerRef}
                rowHeight={getRowSize}
                rowKey={rowKey}
                selection={selection}
                rowClassName={rowClassName}
                editing={editing}
                getContextMenuItems={getContextMenuItems}
                setRowData={setRowData}
                deleteRows={deleteRows}
                insertRowAfter={insertRowAfter}
                duplicateRows={duplicateRows}
                stopEditing={stopEditing}
                cellClassName={cellClassName}
                onScroll={onScroll}
            >
                <SelectionRect
                    columnRights={columnRights}
                    columnWidths={columnWidths}
                    activeCell={activeCell}
                    selection={selection}
                    headerRowHeight={headerRowHeight}
                    rowHeight={getRowSize}
                    hasStickyRightColumn={hasStickyRightColumn}
                    dataLength={data.length}
                    viewHeight={height}
                    viewWidth={width}
                    contentWidth={fullWidth ? undefined : contentWidth}
                    edges={edges}
                    editing={editing}
                    isCellDisabled={isCellDisabled}
                    expandSelection={expandSelection}
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
            {!lockRows && AddRowsComponent && (
                <AddRowsComponent
                    addRows={(count) => insertRowAfter(data.length - 1, count)}
                />
            )}
            {contextMenu && contextMenuItems.length > 0 && (
                <ContextMenuComponent
                    clientX={contextMenu.x}
                    clientY={contextMenu.y}
                    cursorIndex={contextMenu.cursorIndex}
                    items={contextMenuItems}
                    close={() => setContextMenu(null)}
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
