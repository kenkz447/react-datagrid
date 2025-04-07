import { useMemo } from 'react';
import { UseSelectionReturn } from '../../core/hooks/useSelection';

interface RectType {
    readonly width: number;
    readonly height: number;
    readonly left: number;
    readonly top: number;
}

export interface UseSelectionRectsProps {
    readonly columnWidths: number[];
    readonly columnRights: number[];
    readonly headerRowHeight: number;
    readonly data: any[];
    readonly selection: UseSelectionReturn;
    readonly activeCell: { readonly col: number; readonly row: number } | null;
    readonly hasStickyRightColumn: boolean;
    readonly getRowSize: (row: number) => { readonly top: number; readonly height: number };
    readonly expandSelection: number | null;
}

export interface SelectionRectsResult {
    readonly activeCellRect: RectType | null;
    readonly selectionRect: RectType | null;
    readonly expandRowsIndicator: {
        readonly left: number;
        readonly top: number;
        readonly transform: string;
    } | null;
    readonly expandRowsRect: RectType | null;
}

/**
 * Calculate the various selection rectangles needed for the data grid
 * 
 * @param props Properties needed to calculate selection rectangles
 * @returns Object containing the calculated rectangles
 */
export function useSelectionRects(props: UseSelectionRectsProps): SelectionRectsResult {
    const {
        columnWidths,
        columnRights,
        headerRowHeight,
        data,
        selection,
        activeCell,
        hasStickyRightColumn,
        getRowSize,
        expandSelection
    } = props;

    return useMemo(() => {
        const extraPixelV = (rowI: number) => rowI < data.length - 1 ? 1 : 0;
        const extraPixelH = (colI: number) => colI < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 1 : 0;

        const activeCellRect = activeCell ? {
            width: columnWidths[activeCell.col + 1] + extraPixelH(activeCell.col),
            height: getRowSize(activeCell.row).height + extraPixelV(activeCell.row),
            left: columnRights[activeCell.col],
            top: getRowSize(activeCell.row).top + headerRowHeight,
        } : null;

        const selectionRect = selection?.range
            ? {
                width: columnWidths
                    .slice(selection.range?.min.col + 1, selection.range?.max.col + 2)
                    .reduce((a, b) => a + b) + extraPixelH(selection.range?.max.col),
                height: getRowSize(selection.range?.max.row).top +
                    getRowSize(selection.range?.max.row).height -
                    getRowSize(selection.range?.min.row).top +
                    extraPixelV(selection.range?.max.row),
                left: columnRights[selection.range?.min.col],
                top: getRowSize(selection.range?.min.row).top + headerRowHeight,
            }
            : null;

        const minSelection = selection.range?.min || activeCell;
        const maxSelection = selection.range?.max || activeCell;

        const expandRowsIndicator = maxSelection && expandSelection !== null ? {
            left: columnRights[maxSelection.col] + columnWidths[maxSelection.col + 1],
            top: getRowSize(maxSelection.row).top + getRowSize(maxSelection.row).height + headerRowHeight,
            transform: `translate(-${maxSelection.col < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 50 : 100}%, -${maxSelection.row < data.length - 1 ? 50 : 100}%)`,
        } : null;

        const expandRowsRect = minSelection && maxSelection && expandSelection !== null ? {
            width: columnWidths
                .slice(minSelection.col + 1, maxSelection.col + 2)
                .reduce((a, b) => a + b) + extraPixelH(maxSelection.col),
            height: getRowSize(maxSelection.row + expandSelection).top +
                getRowSize(maxSelection.row + expandSelection).height -
                getRowSize(maxSelection.row + 1).top +
                extraPixelV(maxSelection.row + expandSelection) - 1,
            left: columnRights[minSelection.col],
            top: getRowSize(maxSelection.row).top + getRowSize(maxSelection.row).height + headerRowHeight + 1,
        } : null;

        return {
            activeCellRect,
            selectionRect,
            expandRowsIndicator,
            expandRowsRect
        };
    }, [
        columnWidths,
        columnRights,
        headerRowHeight,
        data.length,
        selection,
        activeCell,
        hasStickyRightColumn,
        getRowSize,
        expandSelection
    ]);
}
