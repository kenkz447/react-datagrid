import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useGetBoundingClientRect } from './useGetBoundingClientRect';
import { useColumnWidths, useDebounceState, RowData, Cell, useDatagridCore, DataSheetGridProps, Column } from '../../core';
import { useDatagridScroll } from './useDatagridScroll';
import { useDatagridCursor } from './useDatagridCursor';
import { useCopyHandler } from './useCopy';
import { useCutHandler } from './useCut';
import { usePasteHandler } from './usePaste';
import { useCallbacks } from './useCallbacks';
import { useContextMenuItems } from './useContextMenuItems';
import { useVirtualizers } from './useVirtualizers';

export type UseDatagridReturn<TRow extends RowData = RowData> = ReturnType<typeof useDatagrid<TRow>>;

const BORDER_WIDTH = 1;
const DEFAULT_DATA: any[] = [];
const DEFAULT_COLUMNS: Column<any, any, any>[] = [];
const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_MAX_HEIGHT = 400;

const x = [];

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
        activeCell,
        selectionCell,
        columns,
        getRowSize,
        getRowTotalSize,
        hasStickyRightColumn
    } = coreContext;

    const outerRef = useRef<HTMLDivElement>(null);

    const getOuterBoundingClientRect = useGetBoundingClientRect(outerRef);

    // Width and height of the scrollable area
    const { width, height } = useResizeDetector({
        targetRef: outerRef,
        refreshMode: 'throttle',
        refreshRate: 100,
    });

    const [heightDiff, setHeightDiff] = useDebounceState(BORDER_WIDTH, 100);

    // Height of the list (including scrollbars and borders) to display
    const displayHeight = useMemo(() => Math.min(
        maxHeight,
        headerRowHeight + getRowTotalSize(maxHeight) + heightDiff
    ), [maxHeight, headerRowHeight, getRowTotalSize, heightDiff]);

    setHeightDiff(height ? displayHeight - height : 0);

    const {
        isFullWidth,
        totalWidth: contentWidth,
        columnWidths,
        columnRights,
    } = useColumnWidths(columns, width);

    const innerRef = useRef<HTMLDivElement>(null);
    const getInnerBoundingClientRect = useGetBoundingClientRect(innerRef);

    const scrollTo = useDatagridScroll(coreContext, {
        height,
        width,
        columnRights,
        columnWidths,
        outerRef
    });

    const getCursorIndex = useDatagridCursor(coreContext, {
        columnRights,
        columnWidths,
        getInnerBoundingClientRect,
        getOuterBoundingClientRect
    });

    const beforeTabIndexRef = useRef<HTMLDivElement>(null);
    const afterTabIndexRef = useRef<HTMLDivElement>(null);

    const paste = usePasteHandler(coreContext);
    const copy = useCopyHandler(coreContext);
    const cut = useCutHandler(coreContext, { copy });

    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cursorIndex: Cell } | null>(null);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, [setContextMenu]);

    const contextMenuItems = useContextMenuItems(coreContext, { cut, copy, close: closeContextMenu });

    const { rowVirtualizer, colVirtualizer } = useVirtualizers({
        data,
        outerRef,
        headerRowHeight,
        columnWidths,
        getRowSize,
        columns,
        hasStickyRightColumn,
        rowKey
    });

    useCallbacks(coreContext);

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
        beforeTabIndexRef,
        afterTabIndexRef,
        contextMenuRef,
        width,
        height,
        displayHeight,
        contentWidth,
        columnWidths,
        columnRights,
        isFullWidth,
        contextMenu,
        setHeightDiff,
        scrollTo,
        getCursorIndex,
        setContextMenu,
        disableContextMenu,
        cut,
        copy,
        paste,
        contextMenuItems,
        closeContextMenu,
        rowVirtualizer, 
        colVirtualizer
    };
};
