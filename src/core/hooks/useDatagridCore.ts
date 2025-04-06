import {
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    Cell,
    DataSheetGridProps,
    RowData
} from '../types';
import { useColumns } from './internal/useColumns';
import { useCell } from './useCell';
import { useRowController } from './useRowController';
import { useRowHeights } from './internal/useRowHeights';
import { useCellNavigation } from './useCellNavigation';

export type UseDatagridCoreReturn<TRow extends RowData = RowData> = ReturnType<typeof useDatagridCore<TRow>>;

export function useDatagridCore<TRow extends RowData>(props: DataSheetGridProps<TRow>) {
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

    const [lastEditingCell, setLastEditingCell] = useState<Cell | null>(null);

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
        startSelection,
        endSelection
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
        setGivenRowData,
        deleteGivenRow,
        duplicateGivenRow,
        insertAfterGivenRow,
    } = useRowController({
        dataRef,
        columns,
        data,
        selection,
        activeCell,
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
        dataRef,
        rowHeight,
    });

    const navigation = useCellNavigation({
        data,
        columns,
        editing,
        selection,
        selectionCell,
        activeCell,
        hasStickyRightColumn,
        setActiveCell,
        setEditing,
        setSelectionCell
    });

    return {
        propsRef,
        data,
        columns,
        hasStickyRightColumn,
        selection,
        isCellDisabled,
        expandSelection,
        activeCell, setActiveCell,
        selectionCell, setSelectionCell,
        editing, setEditing,
        expandingSelectionFromRowIndex, setExpandingSelectionFromRowIndex,
        expandSelectionRowsCount, setExpandSelectionRowsCount,
        lastEditingCell, setLastEditingCell,

        selectionMode,
        startSelection,
        endSelection,

        maxHeight,
        headerRowHeight,

        applyPasteDataToDatasheet,
        deleteSelection,
        stopEditing,

        navigation,

        // Calculators
        getRowSize,
        getRowTotalSize,
        getRowIndex,

        // Row Modifiers
        duplicateRows,
        deleteRows,
        setRowData,
        insertRowAfter,
        // Row Modifiers (but performed on a given index)
        setGivenRowData,
        deleteGivenRow,
        duplicateGivenRow,
        insertAfterGivenRow,
    };
};
