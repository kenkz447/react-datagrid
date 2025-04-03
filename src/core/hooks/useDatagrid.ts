import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Cell,
    DataSheetGridProps,
    RowData,
} from '../types';
import { useColumns } from './internal/useColumns';
import { useCell } from './useCell';
import { DatagridContextType } from '../contexts';
import { useRowController } from './useRowController';
import { useRowHeights } from './internal/useRowHeights';

export function useDatagrid<TRow extends RowData>(props: DataSheetGridProps<TRow>): DatagridContextType<TRow> {
    const {
        data,
        gutterColumn,
        stickyRightColumn,
        disableExpandSelection,
        disableSmartDelete,
        lockRows,
        autoAddRow,
        rowHeight,
        maxHeight,
        headerRowHeight,
        createRow,
        duplicateRow,
        onChange
    } = props;

    const lastEditingCellRef = useRef<Cell>(null);
    const propsRef = useRef(props);
    const dataRef = useRef(data);
    dataRef.current = data;

    const [editing, setEditing] = useState(false);

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

    const hasStickyRightColumn = Boolean(stickyRightColumn);

    const rawColumns = props.columns;
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
        applyPasteDataToDatasheet,
        deleteSelection,
        duplicateRows,
        deleteRows,
        insertRowAfter,
        setRowData,
        stopEditing,
    } = useRowController({
        dataRef,
        columns,
        data,
        activeCell,
        selection,
        setActiveCell,
        setSelectionCell,
        editing,
        isCellDisabled,
        lockRows,
        createRow,
        duplicateRow,
        onChange,
        hasStickyRightColumn,
        disableSmartDelete,
        setEditing,
        autoAddRow
    });

    const { getRowSize, getRowTotalSize, getRowIndex } = useRowHeights({
        data,
        rowHeight,
    });

    return useMemo(() => ({
        propsRef,
        lastEditingCellRef,

        data,
        columns,
        hasStickyRightColumn,
        selection,
        isCellDisabled,
        expandSelection,
        activeCell, setActiveCell,
        selectionCell, setSelectionCell,
        editing, setEditing,
        selectionMode, setSelectionMode,
        expandingSelectionFromRowIndex, setExpandingSelectionFromRowIndex,
        expandSelectionRowsCount, setExpandSelectionRowsCount,

        maxHeight,
        headerRowHeight,

        // Calculators
        getRowSize,
        getRowTotalSize,
        getRowIndex,

        // Data controller
        applyPasteDataToDatasheet,
        deleteSelection,
        duplicateRows,
        deleteRows,
        insertRowAfter,
        setRowData,
        stopEditing,
    }), [
        activeCell, columns, data, editing, expandSelection, expandSelectionRowsCount, expandingSelectionFromRowIndex, hasStickyRightColumn, isCellDisabled, selection, selectionCell, selectionMode, setActiveCell, setExpandingSelectionFromRowIndex, setSelectionCell, setSelectionMode, applyPasteDataToDatasheet,
        maxHeight, headerRowHeight,
        getRowSize, getRowTotalSize, getRowIndex,
        deleteSelection, duplicateRows, deleteRows, insertRowAfter, setRowData, stopEditing]
    );
};
