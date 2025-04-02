import {
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    Cell,
    Column,
    DataSheetGridProps,
    RowData,
} from '../types';
import { useColumns } from './internal/useColumns';
import { useRow } from './useRow';
import { useCell } from './useCell';
import { useUI } from './useUI';
import { useContextMenu } from './useContextMenu';

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
    disableContextMenu: disableContextMenuRaw,
    gutterColumn,
    stickyRightColumn,
    autoAddRow,
    lockRows,
    disableExpandSelection,
    createRow,
    onChange,
    duplicateRow,
    disableSmartDelete
}: DataSheetGridProps<TRow>) {

    const {
        expandingSelectionFromRowIndex,
        setExpandingSelectionFromRowIndex,
        activeCell,
        setActiveCell,
        selectionCell,
        setSelectionCell,
        selection,
        selectionMode,
        setSelectionMode
    } = useCell();

    const {
        editing,
        dataRef,
        insertRowAfter,
        setRowData,
        deleteRows,
        stopEditing,
        setEditing,
    } = useRow({
        data,
        onChange,
        createRow,
        lockRows,
        autoAddRow,
        setActiveCell,
        setSelectionCell,
        activeCell,
    });

    const lastEditingCellRef = useRef<Cell | null>(null);
    const hasStickyRightColumn = Boolean(stickyRightColumn);
    const beforeTabIndexRef = useRef<HTMLDivElement>(null);
    const afterTabIndexRef = useRef<HTMLDivElement>(null);

    const columns = useColumns(rawColumns, gutterColumn, stickyRightColumn);

    // Number of rows the user is expanding the selection by, always a number, even when not expanding selection
    const [expandSelectionRowsCount, setExpandSelectionRowsCount] = useState<number>(0);

    // Same as expandSelectionRowsCount but is null when we should not be able to expand the selection
    const expandSelection =
        disableExpandSelection ||
            editing ||
            selectionMode.active ||
            activeCell?.row === data?.length - 1 ||
            selection?.max.row === data?.length - 1 ||
            (activeCell &&
                columns
                    .slice(
                        (selection?.min.col ?? activeCell.col) + 1,
                        (selection?.max.col ?? activeCell.col) + 2
                    )
                    .every((column) => column.disabled === true))
            ? null
            : expandSelectionRowsCount;

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
    } = useUI({
        data,
        columns,
        rowHeight,
        headerRowHeight,
        maxHeight,
        hasStickyRightColumn
    });

    const isCellDisabled = useCallback((cell: Cell): boolean => {
        const disabled = columns[cell.col + 1].disabled;

        return Boolean(typeof disabled === 'function'
            ? disabled({
                rowData: dataRef.current[cell.row], rowIndex: cell.row,
            })
            : disabled
        );
    }, [columns]);

    const {
        contextMenu,
        setContextMenu,
        contextMenuItems,
        getContextMenuItems,
        disableContextMenu,
        setContextMenuItems,
    } = useContextMenu({
        disableContextMenu: disableContextMenuRaw,
        lockRows
    });

    return {
        beforeTabIndexRef,
        afterTabIndexRef,
        outerRef,
        innerRef,
        fullWidth,
        contentWidth,
        displayHeight,
        getRowSize,
        headerRowHeight,
        setRowData,
        setActiveCell,
        setContextMenu,
        rawColumns,
        data,
        columns,
        columnWidths,
        hasStickyRightColumn,
        activeCell,
        selection,
        editing,
        isCellDisabled,
        deleteRows,
        insertRowAfter,
        stopEditing,
        getContextMenuItems,
        columnRights,
        lockRows,
        height,
        width,
        expandSelection,
        contextMenu,
        contextMenuItems,
        scrollTo,
        selectionCell,
        getCursorIndex,
        setSelectionCell,
        setEditing,
        setSelectionMode,
        disableContextMenu,
        lastEditingCellRef,
        setExpandingSelectionFromRowIndex,
        expandingSelectionFromRowIndex,
        expandSelectionRowsCount,
        setExpandSelectionRowsCount,
        onChange,
        selectionMode,
        setContextMenuItems,
        dataRef, 
        createRow,
        duplicateRow,
        disableSmartDelete
    };
};
