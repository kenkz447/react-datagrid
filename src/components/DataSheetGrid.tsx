import {
    DataSheetGridProps,
    RowData
} from '../types';
import { AddRows } from './AddRows';
import { ContextMenu } from './ContextMenu';
import { Grid } from './Grid';
import { SelectionRect } from './SelectionRect';
import { useDatagrid } from '../hooks/useDatagrid';

export function DataSheetGrid<T extends RowData>(props: Partial<DataSheetGridProps<T>>) {
    const {
        className,
        style,
        rowKey,
        rowClassName,
        cellClassName,
        onScroll,
        addRowsComponent: AddRowsComponent = AddRows,
        contextMenuComponent: ContextMenuComponent = ContextMenu,
    } = props;

    const {
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
        edges,
        deleteRows,
        insertRowAfter,
        duplicateRows,
        stopEditing,
        getContextMenuItems,
        columnRights,
        lockRows,
        height,
        width,
        expandSelection,
        contextMenu,
        contextMenuItems,
    } = useDatagrid<T>(props);

    return (
        <div className={className} style={style}>
            <div
                ref={beforeTabIndexRef}
                tabIndex={rawColumns.length && data.length ? 0 : undefined}
                onFocus={(e) => {
                    e.target.blur();
                    setActiveCell({ col: 0, row: 0 });
                }}
            />
            <Grid
                columns={columns}
                outerRef={outerRef}
                columnWidths={columnWidths}
                hasStickyRightColumn={hasStickyRightColumn}
                displayHeight={displayHeight}
                data={data}
                fullWidth={fullWidth}
                headerRowHeight={headerRowHeight}
                activeCell={activeCell}
                innerRef={innerRef}
                rowHeight={getRowSize}
                rowKey={rowKey}
                selection={selection}
                rowClassName={rowClassName}
                editing={editing}
                getContextMenuItems={getContextMenuItems}
                setRowData={setRowData}
                deleteRows={deleteRows}
                insertRowAfter={insertRowAfter}
                duplicateRows={duplicateRows}
                stopEditing={stopEditing}
                cellClassName={cellClassName}
                onScroll={onScroll}
            >
                <SelectionRect
                    columnRights={columnRights}
                    columnWidths={columnWidths}
                    activeCell={activeCell}
                    selection={selection}
                    headerRowHeight={headerRowHeight}
                    rowHeight={getRowSize}
                    hasStickyRightColumn={hasStickyRightColumn}
                    dataLength={data.length}
                    viewHeight={height}
                    viewWidth={width}
                    contentWidth={fullWidth ? undefined : contentWidth}
                    edges={edges}
                    editing={editing}
                    isCellDisabled={isCellDisabled}
                    expandSelection={expandSelection}
                />
            </Grid>
            <div
                ref={afterTabIndexRef}
                tabIndex={rawColumns.length && data.length ? 0 : undefined}
                onFocus={(e) => {
                    e.target.blur();
                    setActiveCell({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: data.length - 1,
                    });
                }}
            />
            {!lockRows && AddRowsComponent && (
                <AddRowsComponent
                    addRows={(count) => insertRowAfter(data.length - 1, count)}
                />
            )}
            {contextMenu && contextMenuItems.length > 0 && (
                <ContextMenuComponent
                    clientX={contextMenu.x}
                    clientY={contextMenu.y}
                    cursorIndex={contextMenu.cursorIndex}
                    items={contextMenuItems}
                    close={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

