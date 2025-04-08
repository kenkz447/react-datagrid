import React, { useMemo } from 'react';
import { RowData, useDragSelect, useKeyBindings, useContextMenu, useVirtualizers, useDatagridContext, useEdges, useSelectionRects } from '@basestacks/react-datagrid';
import cx from 'classnames';

function DatagridImpl<TRow extends RowData = RowData>() {
    const datagrid = useDatagridContext<TRow>();

    const {
        outerRef,
        innerRef,
        displayHeight,
        isFullWidth,
        headerRowHeight,
        columnWidths,
        height,
        width,
        contentWidth,
        data,
        columns,
        selection,
        activeCell,
        setActiveCell,
        getRowSize,
        hasStickyRightColumn,
        rowKey,
        editing,
        stopEditing,
        deleteGivenRow,
        duplicateGivenRow,
        insertAfterGivenRow,
        setGivenRowData,
        isCellDisabled,
        columnRights,
        expandSelection
    } = datagrid;

    useKeyBindings(datagrid);
    useContextMenu(datagrid);
    useDragSelect(datagrid);

    const { rowVirtualizer, colVirtualizer } = useVirtualizers({
        data,
        outerRef,
        headerRowHeight,
        columnWidths,
        getRowSize,
        columns,
        hasStickyRightColumn,
        rowKey,
    });

    const innerStyle = useMemo(() => ({
        width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
        height: rowVirtualizer.getTotalSize(),
    }), [isFullWidth, colVirtualizer, rowVirtualizer]);

    const edges = useEdges(outerRef, width, height);

    const activeCellIsDisabled = activeCell ? isCellDisabled(activeCell) : false;

    const selectionIsDisabled = useMemo(() => {
        if (!selection.range) {
            return activeCellIsDisabled;
        }

        for (let col = selection.range?.min.col; col <= selection.range?.max.col; ++col) {
            for (let row = selection.range?.min.row; row <= selection.range?.max.row; ++row) {
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

    return (
        <div
            ref={outerRef}
            className="dsg-container"
            style={{ height: displayHeight }}
        >
            <div
                tabIndex={columns.length && data.length ? 0 : undefined}
                onFocus={(e) => {
                    e.target.blur();
                    setActiveCell({ col: 0, row: 0 });
                }}
            />
            <div ref={innerRef} style={innerStyle}>
                <div
                    className={cx('dsg-row', 'dsg-row-header')}
                    style={{
                        width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
                        height: headerRowHeight,
                    }}
                >
                    {colVirtualizer.getVirtualItems().map((col) => {
                        const selectionColMin = selection.range?.min.col ?? activeCell?.col;
                        const selectionColMax = selection.range?.max.col ?? activeCell?.col;

                        const className = cx(
                            'dsg-cell-header',
                            selectionColMin !== undefined &&
                            selectionColMax !== undefined &&
                            selectionColMin <= col.index - 1 &&
                            selectionColMax >= col.index - 1 &&
                            'dsg-cell-header-active',
                            columns[col.index].headerClassName
                        );
                        const gutter = col.index === 0;
                        const stickyRight = hasStickyRightColumn && col.index === columns.length - 1;
                        const width = col.size;
                        const left = col.start;
                        const disabled = false;
                        const active = selectionColMin !== undefined;

                        return (
                            <div
                                className={cx(
                                    'dsg-cell',
                                    gutter && 'dsg-cell-gutter',
                                    disabled && 'dsg-cell-disabled',
                                    gutter && active && 'dsg-cell-gutter-active',
                                    stickyRight && 'dsg-cell-sticky-right',
                                    className
                                )}
                                style={{
                                    width,
                                    left: stickyRight ? undefined : left,
                                }}
                            >
                                <div className="dsg-cell-header-container">
                                    {columns[col.index].title}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {rowVirtualizer.getVirtualItems().map((row) => {
                    const selectionMinRow = selection.range?.min.row ?? activeCell?.row;
                    const selectionMaxRow = selection.range?.max.row ?? activeCell?.row;

                    const rowActive = Boolean(
                        row.index >= (selectionMinRow ?? Infinity) &&
                        row.index <= (selectionMaxRow ?? -Infinity)
                    );

                    return (
                        <div
                            className={cx('dsg-row')}
                            style={{
                                height: row.size,
                                top: row.start,
                                width: isFullWidth ? '100%' : colVirtualizer.getTotalSize(),
                            }}
                        >
                            {colVirtualizer.getVirtualItems().map((col) => {
                                const disabled = columns[col.index].disabled;
                                const cellDisabled = disabled === true || (typeof disabled === 'function' && disabled({ rowData: data[row.index], rowIndex: row.index, }));

                                const Component = columns[col.index].component;
                                const cellIsActive = activeCell?.row === row.index && activeCell.col === col.index - 1;
                                const gutter = col.index === 0;
                                const stickyRight = hasStickyRightColumn && col.index === columns.length - 1;
                                const active = col.index === 0 && rowActive;
                                const width = col.size;
                                const left = col.start;

                                return (
                                    <div
                                        className={cx(
                                            'dsg-cell',
                                            gutter && 'dsg-cell-gutter',
                                            disabled && 'dsg-cell-disabled',
                                            gutter && active && 'dsg-cell-gutter-active',
                                            stickyRight && 'dsg-cell-sticky-right'
                                        )}
                                        style={{
                                            width,
                                            left: stickyRight ? undefined : left,
                                        }}
                                    >
                                        <Component
                                            rowData={data[row.index]}
                                            disabled={cellDisabled}
                                            active={cellIsActive}
                                            columnIndex={col.index - 1}
                                            rowIndex={row.index}
                                            focus={cellIsActive && editing}
                                            deleteRow={deleteGivenRow(row.index)}
                                            duplicateRow={duplicateGivenRow(row.index)}
                                            insertRowBelow={insertAfterGivenRow(row.index)}
                                            setRowData={setGivenRowData(row.index)}
                                            stopEditing={stopEditing}
                                            columnData={columns[col.index].columnData}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
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
                            left: columnWidths?.[0] ?? 0,
                            height: height ? height - headerRowHeight : 0,
                            width: contentWidth && width
                                ? width - columnWidths[0] - (hasStickyRightColumn ? columnWidths[columnWidths.length - 1] : 0)
                                : `calc(100% - ${columnWidths?.[0] + (hasStickyRightColumn ? columnWidths?.[columnWidths.length - 1] : 0)}px)`,
                        }}
                    />
                </div>

                {
                    (selectionRect || activeCellRect) && (
                        <>
                            {(selectionRect || activeCellRect) && (
                                <div
                                    className="dsg-selection-col-marker-container"
                                    style={{
                                        left: (selectionRect || activeCellRect)!.left,
                                        width: (selectionRect || activeCellRect)!.width,
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
                            )}

                            {(selectionRect || activeCellRect) && (
                                <div
                                    className="dsg-selection-row-marker-container"
                                    style={{
                                        top: (selectionRect || activeCellRect)!.top,
                                        height: (selectionRect || activeCellRect)!.height,
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
                            )}

                            {activeCellRect && activeCell && (
                                <div
                                    className={cx('dsg-active-cell', {
                                        'dsg-active-cell-focus': editing,
                                        'dsg-active-cell-disabled': activeCellIsDisabled,
                                    })}
                                    style={activeCellRect}
                                />
                            )}

                            {selectionRect && activeCellRect && (
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
                            )}

                            <>
                                {expandRowsRect && <div className="dsg-expand-rows-rect" style={expandRowsRect} />}
                                {expandRowsIndicator && (
                                    <div
                                        className={cx(
                                            'dsg-expand-rows-indicator',
                                            selectionIsDisabled && 'dsg-expand-rows-indicator-disabled'
                                        )}
                                        style={expandRowsIndicator}
                                    />
                                )}
                            </>
                        </>
                    )
                }
            </div>
        </div>
    );
}

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

export const Datagrid = React.memo(DatagridImpl);

