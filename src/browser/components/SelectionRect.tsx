import React, { useMemo } from 'react';
import cx from 'classnames';
import { useDatagridContext, type SelectionContextType } from '../../core';
import { useEdges } from '../hooks/useEdges';
import { useSelectionRects } from '../hooks/useSelectionRects';

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
    readonly headerRowHeight: number;
    readonly columnWidths: number[];
    readonly viewHeight: number | undefined;
    readonly viewWidth: number | undefined;
    readonly contentWidth: number | undefined;
    readonly edges: { readonly top: boolean; readonly right: boolean; readonly bottom: boolean; readonly left: boolean };
    readonly data: any[];
    readonly getRowSize: (row: number) => { readonly top: number; readonly height: number };
    readonly hasStickyRightColumn: boolean;
}

interface RectType {
    readonly width: number;
    readonly height: number;
    readonly left: number;
    readonly top: number;
}

interface SelectionColumnMarkerProps {
    readonly rect: RectType;
    readonly data: any[];
    readonly headerRowHeight: number;
    readonly getRowSize: (row: number) => { readonly top: number; readonly height: number };
    readonly selectionIsDisabled: boolean;
}

interface SelectionRowMarkerProps {
    readonly rect: RectType;
    readonly contentWidth: number | undefined;
    readonly columnWidths: number[];
    readonly selectionIsDisabled: boolean;
}

interface ActiveCellComponentProps {
    readonly rect: RectType;
    readonly editing: boolean;
    readonly isDisabled: boolean;
}

interface SelectionRectComponentProps {
    readonly selectionRect: RectType;
    readonly activeCellRect: RectType;
    readonly selectionIsDisabled: boolean;
}

interface ExpandRowsProps {
    readonly rect?: RectType;
    readonly indicator?: {
        readonly left: number;
        readonly top: number;
        readonly transform: string;
    };
    readonly selectionIsDisabled: boolean;
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
