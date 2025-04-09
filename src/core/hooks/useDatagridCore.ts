import {
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    CellCoordinates,
    DataSheetGridProps,
    ScrollBehavior,
    RowData
} from '../types';
import { useColumns } from './internal/useColumns';
import { useRowController } from './useRowController';
import { useRowHeights } from './internal/useRowHeights';
import { useSelection } from './useSelection';
import { useDeepEqualState } from './internal/useDeepEqualState';

export type UseDatagridCoreReturn<TRow extends RowData = RowData> = ReturnType<typeof useDatagridCore<TRow>>;

export function useDatagridCore<TRow extends RowData>(props: DataSheetGridProps<TRow>) {
    const {
        data,
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

    // When not null, represents the index of the row from which we are expanding
    const [
        expandingSelectionFromRowIndex,
        setExpandingSelectionFromRowIndex,
    ] = useState<number | null>(null);
    // Highlighted cell, null when not focused
    const [activeCell, setActiveCell] = useDeepEqualState<(CellCoordinates & ScrollBehavior) | null>(null);
    const [lastEditingCell, setLastEditingCell] = useState<CellCoordinates | null>(null);

    const propsRef = useRef(props);
    const dataRef = useRef(data);
    dataRef.current = data;

    const [editing, setEditing] = useState(false);

    const hasStickyRightColumn = Boolean(stickyRightColumn);

    const rawColumns = props.columns;
    const columns = useColumns(rawColumns, stickyRightColumn);

    // Number of rows the user is expanding the selection by, always a number, even when not expanding selection
    const [expandSelectionRowsCount, setExpandSelectionRowsCount] = useState<number>(0);

    const selection = useSelection({
        data,
        columns,
        editing,
        activeCell,
        hasStickyRightColumn,
        setActiveCell,
        setEditing,
    });

    // Same as expandSelectionRowsCount but is null when we should not be able to expand the selection
    const expandSelection =
        disableExpandSelection ||
            editing ||
            selection.dragging.active ||
            activeCell?.row === data?.length - 1 ||
            selection.range?.max.row === data?.length - 1 ||
            (activeCell &&
                columns
                    .slice(
                        (selection.range?.min.col ?? activeCell.col) + 1,
                        (selection.range?.max.col ?? activeCell.col) + 2
                    )
                    .every((column) => column.disabled === true))
            ? null
            : expandSelectionRowsCount;

    const isCellDisabled = useCallback((cell: CellCoordinates): boolean => {
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

    return {
        propsRef,
        data,
        columns,
        hasStickyRightColumn,
        isCellDisabled,
        expandSelection,
        activeCell, setActiveCell,
        editing, setEditing,
        expandingSelectionFromRowIndex, setExpandingSelectionFromRowIndex,
        expandSelectionRowsCount, setExpandSelectionRowsCount,
        lastEditingCell, setLastEditingCell,

        maxHeight,
        headerRowHeight,

        applyPasteDataToDatasheet,
        deleteSelection,
        stopEditing,

        selection,

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
