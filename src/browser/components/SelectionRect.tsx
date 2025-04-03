import React, { useMemo } from 'react';
import cx from 'classnames';
import { useDatagridContext, type SelectionContextType } from '../../core';
import { useEdges } from '../hooks/useEdges';

// ===== Utility Functions =====
const buildSquare = (
    top: number | string,
    right: number | string,
    bottom: number | string,
    left: number | string
) => {
    return [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
        [left, top],
    ];
};

const buildClipPath = (
    top: number,
    right: number,
    bottom: number,
    left: number
) => {
    const values = [
        ...buildSquare(0, '100%', '100%', 0),
        ...buildSquare(top, right, bottom, left),
    ];

    return `polygon(evenodd, ${values
        .map((pair) => pair.map((value) => typeof value === 'number' && value !== 0 ? value + 'px' : value).join(' '))
        .join(',')})`;
};

// ===== Interfaces =====
interface ScrollableViewProps {
    headerRowHeight: number;
    columnWidths: number[];
    viewHeight: number | undefined;
    viewWidth: number | undefined;
    contentWidth: number | undefined;
    edges: { top: boolean; right: boolean; bottom: boolean; left: boolean };
    data: any[];
    getRowSize: (row: number) => { top: number; height: number };
    hasStickyRightColumn: boolean;
}

interface RectType {
    width: number;
    height: number;
    left: number;
    top: number;
}

interface SelectionColumnMarkerProps {
    rect: RectType;
    data: any[];
    headerRowHeight: number;
    getRowSize: (row: number) => { top: number; height: number };
    selectionIsDisabled: boolean;
}

interface SelectionRowMarkerProps {
    rect: RectType;
    contentWidth: number | undefined;
    columnWidths: number[];
    selectionIsDisabled: boolean;
}

interface ActiveCellComponentProps {
    rect: RectType;
    editing: boolean;
    isDisabled: boolean;
}

interface SelectionRectComponentProps {
    selectionRect: RectType;
    activeCellRect: RectType;
    selectionIsDisabled: boolean;
}

interface ExpandRowsProps {
    rect?: RectType;
    indicator?: {
        left: number;
        top: number;
        transform: string;
    };
    selectionIsDisabled: boolean;
}

interface UseSelectionRectsProps {
    columnWidths: number[];
    columnRights: number[];
    headerRowHeight: number;
    data: any[];
    selection: { min: { col: number; row: number }; max: { col: number; row: number } } | null;
    activeCell: { col: number; row: number } | null;
    hasStickyRightColumn: boolean;
    getRowSize: (row: number) => { top: number; height: number };
    expandSelection: number | null;
}

// ===== Sub-Components =====
function ScrollableView({
    headerRowHeight,
    columnWidths,
    viewHeight,
    viewWidth,
    contentWidth,
    edges,
    data,
    getRowSize,
    hasStickyRightColumn
}: ScrollableViewProps) {
    return (
        <div
            className="dsg-scrollable-view-container"
            style={{
                height: getRowSize(data.length - 1).top + getRowSize(data.length - 1).height + headerRowHeight,
                width: contentWidth ? contentWidth : '100%',
            }}
        >
            <div
                className={cx({
                    'dsg-scrollable-view': true,
                    'dsg-scrollable-view-t': !edges.top,
                    'dsg-scrollable-view-r': !edges.right,
                    'dsg-scrollable-view-b': !edges.bottom,
                    'dsg-scrollable-view-l': !edges.left,
                })}
                style={{
                    top: headerRowHeight,
                    left: columnWidths[0],
                    height: viewHeight ? viewHeight - headerRowHeight : 0,
                    width: contentWidth && viewWidth
                        ? viewWidth - columnWidths[0] - (hasStickyRightColumn ? columnWidths[columnWidths.length - 1] : 0)
                        : `calc(100% - ${columnWidths[0] + (hasStickyRightColumn ? columnWidths[columnWidths.length - 1] : 0)}px)`,
                }}
            />
        </div>
    );
}

function SelectionColumnMarker({ rect, data, headerRowHeight, getRowSize, selectionIsDisabled }: SelectionColumnMarkerProps) {
    return (
        <div
            className="dsg-selection-col-marker-container"
            style={{
                left: rect.left,
                width: rect.width,
                height: getRowSize(data.length - 1).top + getRowSize(data.length - 1).height + headerRowHeight,
            }}
        >
            <div
                className={cx(
                    'dsg-selection-col-marker',
                    selectionIsDisabled && 'dsg-selection-col-marker-disabled'
                )}
                style={{ top: headerRowHeight }}
            />
        </div>
    );
}

function SelectionRowMarker({ rect, contentWidth, columnWidths, selectionIsDisabled }: SelectionRowMarkerProps) {
    return (
        <div
            className="dsg-selection-row-marker-container"
            style={{
                top: rect.top,
                height: rect.height,
                width: contentWidth ? contentWidth : '100%',
            }}
        >
            <div
                className={cx(
                    'dsg-selection-row-marker',
                    selectionIsDisabled && 'dsg-selection-row-marker-disabled'
                )}
                style={{ left: columnWidths[0] }}
            />
        </div>
    );
}

function ActiveCellComponent({ rect, editing, isDisabled }: ActiveCellComponentProps) {
    return (
        <div
            className={cx('dsg-active-cell', {
                'dsg-active-cell-focus': editing,
                'dsg-active-cell-disabled': isDisabled,
            })}
            style={rect}
        />
    );
}

function SelectionRectComponent({ selectionRect, activeCellRect, selectionIsDisabled }: SelectionRectComponentProps) {
    return (
        <div
            className={cx(
                'dsg-selection-rect',
                selectionIsDisabled && 'dsg-selection-rect-disabled'
            )}
            style={{
                ...selectionRect,
                clipPath: buildClipPath(
                    activeCellRect.top - selectionRect.top,
                    activeCellRect.left - selectionRect.left,
                    activeCellRect.top + activeCellRect.height - selectionRect.top,
                    activeCellRect.left + activeCellRect.width - selectionRect.left
                ),
            }}
        />
    );
}

function ExpandRows({ rect, indicator, selectionIsDisabled }: ExpandRowsProps) {
    return (
        <>
            {rect && <div className="dsg-expand-rows-rect" style={rect} />}
            {indicator && (
                <div
                    className={cx(
                        'dsg-expand-rows-indicator',
                        selectionIsDisabled && 'dsg-expand-rows-indicator-disabled'
                    )}
                    style={indicator}
                />
            )}
        </>
    );
}

// ===== Custom Hooks =====
function useSelectionRects(props: UseSelectionRectsProps) {
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

    const extraPixelV = (rowI) => rowI < data.length - 1 ? 1 : 0;
    const extraPixelH = (colI) => colI < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 1 : 0;

    const activeCellRect = activeCell && {
        width: columnWidths[activeCell.col + 1] + extraPixelH(activeCell.col),
        height: getRowSize(activeCell.row).height + extraPixelV(activeCell.row),
        left: columnRights[activeCell.col],
        top: getRowSize(activeCell.row).top + headerRowHeight,
    };

    const selectionRect = selection && {
        width: columnWidths
            .slice(selection.min.col + 1, selection.max.col + 2)
            .reduce((a, b) => a + b) + extraPixelH(selection.max.col),
        height: getRowSize(selection.max.row).top +
            getRowSize(selection.max.row).height -
            getRowSize(selection.min.row).top +
            extraPixelV(selection.max.row),
        left: columnRights[selection.min.col],
        top: getRowSize(selection.min.row).top + headerRowHeight,
    };

    const minSelection = selection?.min || activeCell;
    const maxSelection = selection?.max || activeCell;

    const expandRowsIndicator = maxSelection && expandSelection !== null && {
        left: columnRights[maxSelection.col] + columnWidths[maxSelection.col + 1],
        top: getRowSize(maxSelection.row).top + getRowSize(maxSelection.row).height + headerRowHeight,
        transform: `translate(-${maxSelection.col < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 50 : 100}%, -${maxSelection.row < data.length - 1 ? 50 : 100}%)`,
    };

    const expandRowsRect = minSelection && maxSelection && expandSelection !== null && {
        width: columnWidths
            .slice(minSelection.col + 1, maxSelection.col + 2)
            .reduce((a, b) => a + b) + extraPixelH(maxSelection.col),
        height: getRowSize(maxSelection.row + expandSelection).top +
            getRowSize(maxSelection.row + expandSelection).height -
            getRowSize(maxSelection.row + 1).top +
            extraPixelV(maxSelection.row + expandSelection) - 1,
        left: columnRights[minSelection.col],
        top: getRowSize(maxSelection.row).top + getRowSize(maxSelection.row).height + headerRowHeight + 1,
    };

    return {
        activeCellRect,
        selectionRect,
        expandRowsIndicator,
        expandRowsRect
    };
}

// ===== Main Component =====
function SelectionRectImpl(props: SelectionContextType) {
    const {
        outerRef,
        columnWidths,
        columnRights,
        viewWidth,
        viewHeight,
        contentWidth
    } = props;

    const {
        data,
        headerRowHeight,
        selection,
        activeCell,
        hasStickyRightColumn,
        isCellDisabled,
        editing,
        expandSelection,
        getRowSize
    } = useDatagridContext();

    const activeCellIsDisabled = activeCell ? isCellDisabled(activeCell) : false;
    const edges = useEdges(outerRef, viewWidth, viewHeight);

    const selectionIsDisabled = useMemo(() => {
        if (!selection) {
            return activeCellIsDisabled;
        }

        for (let col = selection.min.col; col <= selection.max.col; ++col) {
            for (let row = selection.min.row; row <= selection.max.row; ++row) {
                if (!isCellDisabled({ col, row })) {
                    return false;
                }
            }
        }

        return true;
    }, [activeCellIsDisabled, isCellDisabled, selection]);

    const {
        activeCellRect,
        selectionRect,
        expandRowsIndicator,
        expandRowsRect
    } = useSelectionRects({
        columnWidths,
        columnRights,
        headerRowHeight,
        data,
        selection,
        activeCell,
        hasStickyRightColumn,
        getRowSize,
        expandSelection
    });

    if (!columnWidths || !columnRights) {
        return null;
    }

    return (
        <>
            <ScrollableView
                headerRowHeight={headerRowHeight}
                columnWidths={columnWidths}
                viewHeight={viewHeight}
                viewWidth={viewWidth}
                contentWidth={contentWidth}
                edges={edges}
                data={data}
                getRowSize={getRowSize}
                hasStickyRightColumn={hasStickyRightColumn}
            />
            
            {(selectionRect || activeCellRect) && (
                <SelectionColumnMarker
                    rect={selectionRect || activeCellRect}
                    data={data}
                    headerRowHeight={headerRowHeight}
                    getRowSize={getRowSize}
                    selectionIsDisabled={selectionIsDisabled}
                />
            )}
            
            {(selectionRect || activeCellRect) && (
                <SelectionRowMarker
                    rect={selectionRect || activeCellRect}
                    contentWidth={contentWidth}
                    columnWidths={columnWidths}
                    selectionIsDisabled={selectionIsDisabled}
                />
            )}
            
            {activeCellRect && activeCell && (
                <ActiveCellComponent
                    rect={activeCellRect}
                    editing={editing}
                    isDisabled={activeCellIsDisabled}
                />
            )}
            
            {selectionRect && activeCellRect && (
                <SelectionRectComponent
                    selectionRect={selectionRect}
                    activeCellRect={activeCellRect}
                    selectionIsDisabled={selectionIsDisabled}
                />
            )}
            
            <ExpandRows
                rect={expandRowsRect}
                indicator={expandRowsIndicator}
                selectionIsDisabled={selectionIsDisabled}
            />
        </>
    );
}

export const SelectionRect = React.memo<SelectionContextType>(SelectionRectImpl);
