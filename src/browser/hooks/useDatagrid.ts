import { useCallback, useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useColumnWidths, RowData, Cell, useDatagridCore, DataSheetGridProps, Column } from '../../core';
import { useDatagridScroll } from './useDatagridScroll';
import { useDatagridCursor } from './useDatagridCursor';
import { useCopyHandler } from './useCopy';
import { useCutHandler } from './useCut';
import { usePasteHandler } from './usePaste';
import { useCallbacks } from './useCallbacks';

export type UseDatagridReturn<TRow extends RowData = RowData> = ReturnType<typeof useDatagrid<TRow>>;

const DEFAULT_DATA: any[] = [];
const DEFAULT_COLUMNS: Column<any, any, any>[] = [];
const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_MAX_HEIGHT = 400;

export function useDatagrid<TRow extends RowData>({
    data = DEFAULT_DATA,
    columns: rawColumns = DEFAULT_COLUMNS,
    maxHeight = DEFAULT_MAX_HEIGHT,
    rowHeight = DEFAULT_ROW_HEIGHT,
    headerRowHeight = typeof rowHeight === 'number' ? rowHeight : DEFAULT_ROW_HEIGHT,
    ...props
}: Partial<DataSheetGridProps<TRow>>) {
    const { rowKey, disableContextMenu } = props;

    const coreContext = useDatagridCore<TRow>({
        data,
        columns: rawColumns,
        maxHeight,
        rowHeight,
        headerRowHeight,
        ...props,
    });

    const {
        selection,
        activeCell,
        columns
    } = coreContext;

    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    // Width and height of the scrollable area
    const { width, height } = useResizeDetector({
        targetRef: outerRef,
        refreshMode: 'throttle',
        refreshRate: 100,
    });

    const {
        isFullWidth,
        totalWidth: contentWidth,
        columnWidths,
        columnRights,
    } = useColumnWidths(columns, width);

    const scrollTo = useDatagridScroll(coreContext, {
        outerRef,
        height,
        width,
        columnRights,
        columnWidths,
    });

    const getCursorIndex = useDatagridCursor(coreContext, {
        outerRef,
        innerRef,
        columnRights,
        columnWidths
    });

    const paste = usePasteHandler(coreContext);
    const copy = useCopyHandler(coreContext);
    const cut = useCutHandler(coreContext, { copy });

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cursorIndex: Cell } | null>(null);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, [setContextMenu]);

    useCallbacks(coreContext);

    // Scroll to the selectionCell cell when it changes
    useEffect(() => {
        if (selection.cell) {
            scrollTo(selection.cell);
        }
    }, [selection.cell, scrollTo]);

    // Scroll to the active cell when it changes
    useEffect(() => {
        if (activeCell) {
            scrollTo(activeCell);
        }
    }, [activeCell, scrollTo]);

    const haveActiveCell = activeCell !== null;
    useEffect(() => {
        if (haveActiveCell) {
            // Blur any element on focusing the grid
            (document.activeElement as HTMLElement).blur();
            window.getSelection()?.removeAllRanges();
        }
    }, [haveActiveCell]);

    return {
        ...coreContext,
        rowKey,
        outerRef,
        innerRef,
        width,
        height,
        contentWidth,
        columnWidths,
        columnRights,
        isFullWidth,
        contextMenu,
        scrollTo,
        getCursorIndex,
        setContextMenu,
        disableContextMenu,
        cut,
        copy,
        paste,
        closeContextMenu
    };
};
