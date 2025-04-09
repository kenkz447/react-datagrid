import { CellCoordinates, Column, DataSheetGridProps as DataGridProps, RangeSelection, RowData, ScrollBehavior, SimpleColumn, SelectionMode, Operation, RowSize } from '../types';
import deepEqual from 'fast-deep-equal';

type EventEmitterCallback = (...args: unknown[]) => void;

class EventEmitter {
    readonly callbacks: { [key: string]: EventEmitterCallback[] };

    constructor() {
        this.callbacks = {};
    }

    public on(event: string, cb: EventEmitterCallback) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(cb);
        return () => {
            this.callbacks[event] = this.callbacks[event].filter((callback) => callback !== cb);
        };
    }

    public emit(event: string, data: unknown) {
        const cbs = this.callbacks[event];
        if (cbs) {
            cbs.forEach(cb => cb(data));
        }
    }
}

type ObservableSetter<T> = (value: T | ((oldValue: T) => T)) => void;

type Observable<T> = {
    value: T;
    set: ObservableSetter<T>;
    subscribe: (listener: EventEmitterCallback) => () => void;
}

export const observable = <T>(defaultValue: T) => ({
    events: new EventEmitter(),
    value: defaultValue,
    subscribe: function (listener) {
        return this.$events.on('update_value', listener);
    },
    set(nextValue: ((oldValue: T) => T) | T) {
        this.$value = typeof nextValue === 'function' ? (nextValue as (oldValue: T) => T)(this.value) : nextValue;
        this.events.emit('update_value', this.$value);
    }
} as Observable<T>);

const defaultIsCellEmpty = () => false;
const identityRow = <TRow extends RowData>({ rowData }: { rowData: TRow }) => rowData;
const defaultCopyValue = () => null;

const cellAlwaysEmpty = () => true;
const defaultPrePasteValues = (values: string[]) => values;

export const parseFlexValue = (value: string | number) => {
    if (typeof value === 'number') {
        return {
            basis: 0,
            grow: value,
            shrink: 1,
        };
    }

    if (value.match(/^ *\d+(\.\d*)? *$/)) {
        return {
            basis: 0,
            grow: parseFloat(value.trim()),
            shrink: 1,
        };
    }

    if (value.match(/^ *\d+(\.\d*)? *px *$/)) {
        return {
            basis: parseFloat(value.trim()),
            grow: 1,
            shrink: 1,
        };
    }

    if (value.match(/^ *\d+(\.\d*)? \d+(\.\d*)? *$/)) {
        const [grow, shrink] = value.trim().split(' ');
        return {
            basis: 0,
            grow: parseFloat(grow),
            shrink: parseFloat(shrink),
        };
    }

    if (value.match(/^ *\d+(\.\d*)? \d+(\.\d*)? *px *$/)) {
        const [grow, basis] = value.trim().split(' ');
        return {
            basis: parseFloat(basis),
            grow: parseFloat(grow),
            shrink: 1,
        };
    }

    if (value.match(/^ *\d+(\.\d*)? \d+(\.\d*)? \d+(\.\d*)? *px *$/)) {
        const [grow, shrink, basis] = value.trim().split(' ');
        return {
            basis: parseFloat(basis),
            grow: parseFloat(grow),
            shrink: parseFloat(shrink),
        };
    }

    return {
        basis: 0,
        grow: 1,
        shrink: 1,
    };
};

const add = ({
    columnLength,
    maxRow,
    hasStickyRightColumn,
    offset,
    cell
}: { columnLength: number, maxRow: number, hasStickyRightColumn: boolean, offset: [number, number], cell: CellCoordinates | null }): CellCoordinates | null => {
    // Return null if cell is null
    if (!cell) return null;

    const [deltaX, deltaY] = offset;

    // Calculate column boundaries
    const minCol = 0;
    const maxCol = columnLength - (hasStickyRightColumn ? 3 : 2);

    // Calculate row boundaries
    const minRow = 0;

    // Create new cell with position clamped within boundaries
    return {
        col: Math.max(minCol, Math.min(maxCol, cell.col + deltaX)),
        row: Math.max(minRow, Math.min(maxRow, cell.row + deltaY)),
    };
};

const createColumns = (columns: Column[], stickyRightColumn?: SimpleColumn) => {
    const partialColumns: Column<any, any, any>[] = [...columns];

    if (stickyRightColumn) {
        partialColumns.push({
            ...stickyRightColumn,
            basis: stickyRightColumn?.basis ?? 40,
            grow: stickyRightColumn?.grow ?? 0,
            shrink: stickyRightColumn?.shrink ?? 0,
            minWidth: stickyRightColumn.minWidth ?? 0,
            isCellEmpty: cellAlwaysEmpty,
        });
    }

    return partialColumns.map((column) => {
        const legacyWidth =
            column.width !== undefined
                ? parseFlexValue(column.width)
                : {
                    basis: undefined,
                    grow: undefined,
                    shrink: undefined,
                };

        return {
            ...column,
            basis: column.basis ?? legacyWidth.basis ?? 0,
            grow: column.grow ?? legacyWidth.grow ?? 1,
            shrink: column.shrink ?? legacyWidth.shrink ?? 1,
            minWidth: column.minWidth ?? 100,
            disableKeys: column.disableKeys ?? false,
            disabled: column.disabled ?? false,
            keepFocus: column.keepFocus ?? false,
            deleteValue: column.deleteValue ?? identityRow,
            copyValue: column.copyValue ?? defaultCopyValue,
            pasteValue: column.pasteValue ?? identityRow,
            prePasteValues: column.prePasteValues ?? defaultPrePasteValues,
            isCellEmpty: column.isCellEmpty ?? defaultIsCellEmpty,
        };
    });
};

export class DataGridCore<TRow extends RowData = RowData> {
    constructor(props: DataGridProps<TRow>) {
        // Initialization logic here
        this.columns.set(createColumns(props.columns || []));
        this.data.set(props.data || []);
        this.hasStickyRightColumn.set(Boolean(props.stickyRightColumn));
        this.lockRows.set(Boolean(props.lockRows));
        this.rowHeight = props.rowHeight || 40;

        this._onChange = props.onChange || null;
        this._duplicateRow = props.duplicateRow || null;
        this._createRow = props.createRow || null;
        this._disableSmartDelete = Boolean(props.disableSmartDelete);
        this._autoAddRow = Boolean(props.autoAddRow);
    }
    private _calculatedHeights = observable<RowSize[]>([]);
    private _onChange: DataGridProps<TRow>['onChange'] | null = null;
    private _duplicateRow: DataGridProps<TRow>['duplicateRow'] | null = null;
    private _createRow: DataGridProps<TRow>['createRow'] | null = null;
    private _disableSmartDelete = false;
    private _autoAddRow = false;

    public columns = observable<Column<any, any, any>[]>([]);
    public data = observable<TRow[]>([]);
    public hasStickyRightColumn = observable(false);
    public lockRows = observable(false);
    public rowHeight: DataGridProps<TRow>['rowHeight'] | number = 40;

    public activeCell = observable<(CellCoordinates & ScrollBehavior) | null>(null);
    public lastEditingCell = observable<CellCoordinates | null>(null);
    public selectedCell = observable<(CellCoordinates & ScrollBehavior) | null>(null);
    public selectedRange = observable<RangeSelection | null>(null);
    public dragging = observable<SelectionMode>({
        columns: false,
        rows: false,
        active: false,
    });
    public editing = observable(false);
    public expandSelectionRowsCount = observable(0);
    public expandSelection = observable<number>(null);
    public expandingSelectionFromRowIndex = observable<number | null>(null);

    public isCellDisabled = (rowIndex: number, columnIndex: number) => {
        const column = this.columns.value[columnIndex];
        if (column) {
            const disabled = column.disabled;
            return typeof disabled === 'function' ? disabled({ rowData: {}, rowIndex }) : disabled;
        }
        return false;
    };

    public existFocus = () => {
        this.selectedCell.set(null);
        this.editing.set(false);
        this.activeCell.set(null);
        this.selectedRange.set(null);
    };

    public goPrevRow = () => {
        this.editing.set(false);
        this.activeCell.set((cell) => ({
            col: this.columns.value.length - (this.hasStickyRightColumn.value ? 3 : 2),
            row: (cell?.row ?? 1) - 1,
        }));
        this.selectedCell.set(null);
    };

    public goNextRow = () => {
        this.editing.set(false);
        this.activeCell.set((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }));
        this.selectedCell.set(null);
    };

    public goRight = () => {
        const direction: [number, number] = [1, 0];
        this.editing.set(false);
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
    };

    public goLeft = () => {
        const direction: [number, number] = [-1, 0];
        this.selectedCell.set(null);
        this.editing.set(false);
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
    };

    public goDown = () => {
        const direction: [number, number] = [0, 1];
        this.editing.set(false);
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
    };

    public goUp = () => {
        const direction: [number, number] = [0, -1];
        this.editing.set(false);
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
    };

    public jumpRight = () => {
        const direction: [number, number] = [this.columns.value.length, 0];
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
        this.editing.set(false);
    };

    public jumpLeft = () => {
        const direction: [number, number] = [-this.columns.value.length, 0];
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
        this.editing.set(false);
    };

    public jumpDown = () => {
        const direction: [number, number] = [0, this.data.value.length];
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
        this.editing.set(false);
    };

    public jumpUp = () => {
        const direction: [number, number] = [0, -this.data.value.length];
        this.activeCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
        this.selectedCell.set(null);
        this.editing.set(false);
    };

    public selectLeft = () => {
        const direction: [number, number] = [-1, 0];
        this.selectedCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
    };

    public selectRight = () => {
        const direction: [number, number] = [1, 0];
        this.selectedCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
    };

    public selectDown = () => {
        const direction: [number, number] = [0, 1];
        this.selectedCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
    };

    public selectUp = () => {
        const direction: [number, number] = [0, -1];
        this.selectedCell.set((cell) => add({
            columnLength: this.columns.value.length,
            maxRow: this.data.value.length - 1,
            hasStickyRightColumn: this.hasStickyRightColumn.value,
            offset: direction,
            cell
        }));
    };

    public selectAll = () => {
        this.editing.set(false);
        this.activeCell.set({
            col: 0,
            row: 0,
            doNotScrollY: true,
            doNotScrollX: true,
        });
        this.selectedCell.set({
            col: this.columns.value.length - (this.hasStickyRightColumn.value ? 3 : 2),
            row: this.data.value.length - 1,
            doNotScrollY: true,
            doNotScrollX: true,
        });
    };

    public startDragging = (dragSelect: Omit<SelectionMode, 'active'>) => {
        this.dragging.set({
            ...dragSelect,
            active: true,
        });
    };

    public stopDragging = () => {
        this.dragging.set({
            columns: false,
            rows: false,
            active: false,
        });
    };

    public duplicateRows = (rowMin: number, rowMax: number = rowMin) => {
        if (this.lockRows.value) {
            return;
        }

        this._onChange?.(
            [
                ...this.data.value.slice(0, rowMax + 1),
                ...this.data.value
                    .slice(rowMin, rowMax + 1)
                    .map((rowData, i) => this._duplicateRow ? this._duplicateRow({ rowData, rowIndex: i + rowMin }) : { ...rowData }),
                ...this.data.value.slice(rowMax + 1),
            ],
            [
                {
                    type: 'CREATE',
                    fromRowIndex: rowMax + 1,
                    toRowIndex: rowMax + 2 + rowMax - rowMin,
                },
            ]
        );
        this.activeCell.set({ col: 0, row: rowMax + 1, doNotScrollX: true });
        this.selectedCell.set({
            col: this.columns.value.length - (this.hasStickyRightColumn.value ? 3 : 2),
            row: 2 * rowMax - rowMin + 1,
            doNotScrollX: true,
        });
        this.editing.set(false);
    };

    public applyPasteDataToDatasheet = async (pasteData: string[][]) => {
        if (!this.editing.value && this.activeCell.value) {
            const min: CellCoordinates = this.selectedRange?.value.min || this.activeCell.value;
            const max: CellCoordinates = this.selectedRange?.value.max || this.activeCell.value;

            const results = await Promise.all(
                pasteData[0].map((_, columnIndex) => {
                    const prePasteValues = this.columns.value[min.col + columnIndex + 1]?.prePasteValues;
                    const values = pasteData.map((row) => row[columnIndex]);
                    return prePasteValues?.(values) ?? values;
                })
            );

            pasteData = pasteData.map((_, rowIndex) =>
                results.map((column) => column[rowIndex])
            );

            // Paste single row
            if (pasteData.length === 1) {
                const newData = [...this.data.value];

                for (
                    let columnIndex = 0;
                    columnIndex < pasteData[0].length;
                    columnIndex++
                ) {
                    const pasteValue = this.columns.value[min.col + columnIndex + 1]?.pasteValue;

                    if (pasteValue) {
                        for (let rowIndex = min.row; rowIndex <= max.row; rowIndex++) {
                            if (!this.isCellDisabled(rowIndex, columnIndex + min.col)) {
                                newData[rowIndex] = await pasteValue({
                                    rowData: newData[rowIndex],
                                    value: pasteData[0][columnIndex],
                                    rowIndex,
                                });
                            }
                        }
                    }
                }

                this._onChange?.(newData, [
                    {
                        type: 'UPDATE',
                        fromRowIndex: min.row,
                        toRowIndex: max.row + 1,
                    },
                ]);

                this.activeCell.set({ col: min.col, row: min.row });
                this.selectedCell.set({
                    col: Math.min(
                        min.col + pasteData[0].length - 1,
                        this.columns.value.length - (this.hasStickyRightColumn.value ? 3 : 2)
                    ),
                    row: max.row,
                });
            } else {
                // Paste multiple rows
                let newData = [...this.data.value];
                const missingRows = min.row + pasteData.length - this.data.value.length;

                if (missingRows > 0) {
                    if (!this.lockRows.value) {
                        newData = [
                            ...newData,
                            ...new Array(missingRows).fill(0).map(() => this._createRow ? this._createRow() : {} as TRow),
                        ];
                    } else {
                        pasteData.splice(pasteData.length - missingRows, missingRows);
                    }
                }

                for (
                    let columnIndex = 0;
                    columnIndex < pasteData[0].length &&
                    min.col + columnIndex <
                    this.columns.value.length - (this.hasStickyRightColumn.value ? 2 : 1);
                    columnIndex++
                ) {
                    const pasteValue =
                        this.columns.value[min.col + columnIndex + 1]?.pasteValue;

                    if (pasteValue) {
                        for (
                            let rowIndex = 0;
                            rowIndex < pasteData.length;
                            rowIndex++
                        ) {
                            if (!this.isCellDisabled(min.row + rowIndex, min.col + columnIndex)) {
                                newData[min.row + rowIndex] = await pasteValue({
                                    rowData: newData[min.row + rowIndex],
                                    value: pasteData[rowIndex][columnIndex],
                                    rowIndex: min.row + rowIndex,
                                });
                            }
                        }
                    }
                }

                const operations: Operation[] = [
                    {
                        type: 'UPDATE',
                        fromRowIndex: min.row,
                        toRowIndex:
                            min.row +
                            pasteData.length -
                            (!this.lockRows.value && missingRows > 0 ? missingRows : 0),
                    },
                ];

                if (missingRows > 0 && !this.lockRows.value) {
                    operations.push({
                        type: 'CREATE',
                        fromRowIndex: min.row + pasteData.length - missingRows,
                        toRowIndex: min.row + pasteData.length,
                    });
                }

                this._onChange?.(newData, operations);
                this.activeCell.set({ col: min.col, row: min.row });
                this.selectedCell.set({
                    col: Math.min(
                        min.col + pasteData[0].length - 1,
                        this.columns.value.length - (this.hasStickyRightColumn.value ? 3 : 2)
                    ),
                    row: min.row + pasteData.length - 1,
                });
            }
        }
    };

    public deleteRows = (rowMin: number, rowMax: number = rowMin) => {
        if (this.lockRows) {
            return;
        }

        this.editing.set(false);
        this.activeCell.set((a) => {
            const row = Math.min(
                this.data.value.length - 2 - rowMax + rowMin,
                rowMin
            );

            if (row < 0) {
                return null;
            }

            return a && { col: a.col, row };
        });
        this.selectedCell.set(null);
        this._onChange?.(
            [
                ...this.data.value.slice(0, rowMin),
                ...this.data.value.slice(rowMax + 1),
            ],
            [
                {
                    type: 'DELETE',
                    fromRowIndex: rowMin,
                    toRowIndex: rowMax + 1,
                },
            ]
        );
    };

    public deleteSelection = (_smartDelete = true) => {
        const smartDelete = _smartDelete && !this._disableSmartDelete;
        if (!this.activeCell.value) {
            return;
        }

        const min: CellCoordinates = this.selectedRange.value.min || this.activeCell.value;
        const max: CellCoordinates = this.selectedRange.value.max || this.activeCell.value;

        if (
            this.data.value.slice(min.row, max.row + 1).every((rowData, i) =>
                this.columns.value.every((column) =>
                    column.isCellEmpty({ rowData, rowIndex: i + min.row })
                )
            )
        ) {
            if (smartDelete) {
                this.deleteRows(min.row, max.row);
            }
            return;
        }

        const newData = [...this.data.value];

        for (let row = min.row; row <= max.row; ++row) {
            for (let col = min.col; col <= max.col; ++col) {
                if (!this.isCellDisabled(row, col)) {
                    const { deleteValue = ({ rowData }) => rowData } =
                        this.columns.value[col + 1];
                    newData[row] = deleteValue({
                        rowData: newData[row],
                        rowIndex: row,
                    });
                }
            }
        }

        if (smartDelete && deepEqual(newData, this.data.value)) {
            this.activeCell.set({ col: 0, row: min.row, doNotScrollX: true });
            this.selectedCell.set({
                col: this.columns.value.length - (this.hasStickyRightColumn.value ? 3 : 2),
                row: max.row,
                doNotScrollX: true,
            });
            return;
        }

        this._onChange?.(newData, [
            {
                type: 'UPDATE',
                fromRowIndex: min.row,
                toRowIndex: max.row + 1,
            },
        ]);
    };

    public insertRowAfter = (rowIndex: number, count = 1) => {
        if (this.lockRows) {
            return;
        }

        this.selectedCell.set(null);
        this.editing.set(false);

        this._onChange?.(
            [
                ...this.data.value.slice(0, rowIndex + 1),
                ...new Array(count).fill(0).map(() => this._createRow?.() ?? {} as TRow),
                ...this.data.value.slice(rowIndex + 1),
            ],
            [
                {
                    type: 'CREATE',
                    fromRowIndex: rowIndex + 1,
                    toRowIndex: rowIndex + 1 + count,
                },
            ]
        );
        this.activeCell.set((a) => ({
            col: a?.col || 0,
            row: rowIndex + count,
            doNotScrollX: true,
        }));
    };

    public setRowData = (rowIndex: number, item: TRow) => {
        this._onChange?.(
            [
                ...(this.data.value?.slice(0, rowIndex) ?? []),
                item,
                ...(this.data.value?.slice(rowIndex + 1) ?? []),
            ],
            [
                {
                    type: 'UPDATE',
                    fromRowIndex: rowIndex,
                    toRowIndex: rowIndex + 1,
                },
            ]
        );
    };

    public stopEditing = ({ nextRow = true } = {}) => {
        if (this.activeCell.value?.row === this.data.value.length - 1) {
            if (nextRow && this._autoAddRow) {
                this.insertRowAfter(this.activeCell.value.row);
            } else {
                this.editing.set(false);
            }
        } else {
            this.editing.set(false);

            if (nextRow) {
                this.activeCell.set((a) => a && { col: a.col, row: a.row + 1 });
            }
        }
    };

    public getRowIndex = (top: number): number => {
        if (typeof this.rowHeight === 'number') {
            return Math.min(
                this.data.value.length - 1,
                Math.max(-1, Math.floor(top / this.rowHeight))
            );
        }

        let l = 0;
        let r = this._calculatedHeights.value.length - 1;

        while (l <= r) {
            const m = Math.floor((l + r) / 2);

            if (this._calculatedHeights.value[m].top < top) {
                l = m + 1;
            } else if (this._calculatedHeights.value[m].top > top) {
                r = m - 1;
            } else {
                return m;
            }
        }

        if (
            r === this._calculatedHeights.value.length - 1 &&
            this.data.value.length > this._calculatedHeights.value.length &&
            (!this._calculatedHeights.value.length || top >= this._calculatedHeights.value[r].top + this._calculatedHeights.value[r].height)
        ) {
            let lastBottom = r === -1 ? 0 : this._calculatedHeights.value[r].top + this._calculatedHeights.value[r].height;

            do {
                r++;
                const height = this.rowHeight({ rowIndex: r, rowData: this.data.value[r] });
                this._calculatedHeights.value.push({
                    height,
                    top: lastBottom,
                });
                lastBottom += height;
            } while (lastBottom <= top && r < this._calculatedHeights.value.length - 1);
        }

        return r;
    };

    public getRowSize = (rowIndex: number): RowSize => {
        if (typeof this.rowHeight === 'number') {
            return { height: this.rowHeight, top: this.rowHeight * rowIndex };
        }

        if (rowIndex >= this.data.value.length) {
            return { height: 0, top: 0 };
        }

        if (rowIndex < this._calculatedHeights.value.length) {
            return this._calculatedHeights.value[rowIndex];
        }

        let lastBottom =
            this._calculatedHeights.value[this._calculatedHeights.value.length - 1].top +
            this._calculatedHeights.value[this._calculatedHeights.value.length - 1].height;

        for (let i = this._calculatedHeights.value.length; i <= rowIndex; i++) {
            const height = this.rowHeight({ rowIndex: i, rowData: this.data.value[i] });

            this._calculatedHeights.value.push({ height, top: lastBottom });
            lastBottom += height;
        }

        return this._calculatedHeights.value[rowIndex];
    };

    public getRowTotalSize = (maxHeight: number): number => {
        if (typeof this.rowHeight === 'number') {
            return this.data.value.length * this.rowHeight;
        }

        const index = this.getRowIndex(maxHeight);

        return (
            this._calculatedHeights.value[index].top +
            this._calculatedHeights.value[index].height
        );
    };
};

