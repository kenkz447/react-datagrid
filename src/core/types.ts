import React, { RefObject } from 'react';

export interface Cell {
  readonly col: number
  readonly row: number
}

export interface ScrollBehavior {
  readonly doNotScrollX?: boolean
  readonly doNotScrollY?: boolean
}

export interface Selection {
  readonly min: Cell;
  readonly max: Cell
}

export type RowData = Record<string, any>;

export interface RowSize {
  readonly height: number;
  readonly top: number
}

export interface CellProps<TValue> {
  readonly value?: TValue;
  readonly active: boolean;
  readonly focus: boolean;
  readonly disabled: boolean;
}

export type CellClassName<TValue> = string | ((opt: { rowData: TValue; rowIndex: number; columnId?: string }) => string | undefined);

export interface Column<TValue, C, PasteValue> {
  readonly id?: string
  readonly title?: React.ReactNode
  /** @deprecated */
  readonly headerClassName?: string | ((opt: { columnId: string }) => string | undefined)
  /** @deprecated Use `basis`, `grow`, and `shrink` instead */
  readonly width?: string | number
  readonly basis?: number
  readonly grow?: number
  readonly shrink?: number
  readonly minWidth?: number
  readonly maxWidth?: number
  readonly component?: React.ComponentType<CellProps<TValue>>
  readonly columnData?: C
  readonly disableKeys?: boolean
  readonly disabled?: boolean | ((opt: { rowData: TValue; rowIndex: number }) => boolean)
  readonly cellClassName?: CellClassName<TValue>
  readonly keepFocus?: boolean
  readonly deleteValue?: (opt: { rowData: TValue; rowIndex: number }) => TValue
  readonly copyValue?: (opt: { rowData: TValue; rowIndex: number }) => number | string | null
  readonly pasteValue?: (opt: { rowData: TValue; value: PasteValue; rowIndex: number }) => TValue
  readonly prePasteValues?: (values: string[]) => PasteValue[] | Promise<PasteValue[]>
  readonly isCellEmpty?: (opt: { rowData: TValue; rowIndex: number }) => boolean
}

export interface SelectionContextType {
  readonly outerRef: RefObject<HTMLElement>;
  readonly columnRights?: number[]
  readonly columnWidths?: number[]
  readonly viewWidth?: number
  readonly viewHeight?: number
  readonly contentWidth?: number
}

export type SimpleColumn<T, C> = Partial<
  Pick<
    Column<T, C, string>,
    | 'title'
    | 'maxWidth'
    | 'minWidth'
    | 'basis'
    | 'grow'
    | 'shrink'
    | 'component'
    | 'columnData'
  >
>

export type ContextMenuItem =
  | {
    readonly type: 'INSERT_ROW_BELLOW' | 'DELETE_ROW' | 'DUPLICATE_ROW' | 'COPY' | 'CUT' | 'PASTE'
    readonly action: () => void
  }
  | {
    readonly type: 'DELETE_ROWS' | 'DUPLICATE_ROWS'
    readonly action: () => void
    readonly fromRow: number
    readonly toRow: number
  }

export interface ContextMenuComponentProps {
  readonly clientX: number
  readonly clientY: number
  readonly cursorIndex: Cell
  readonly close: () => void
}

export interface Operation {
  readonly type: 'UPDATE' | 'DELETE' | 'CREATE'
  readonly fromRowIndex: number
  readonly toRowIndex: number
}

export type RowKey<TRow extends RowData> = keyof TRow | ((opts: { rowData: TRow; rowIndex: number }) => TRow[keyof TRow])

export interface DataSheetGridProps<TRow extends RowData = RowData> {
  readonly data?: TRow[]
  readonly onChange?: (value: TRow[], operations: Operation[]) => void
  readonly columns?: Partial<Column<TRow, any, any>>[]
  readonly gutterColumn?: SimpleColumn<TRow, any> | false
  readonly stickyRightColumn?: SimpleColumn<TRow, any>
  readonly rowKey?: RowKey<TRow>;
  readonly maxHeight?: number
  readonly rowHeight?: number | ((opt: { rowData: TRow; rowIndex: number }) => number)
  readonly headerRowHeight?: number
  readonly createRow?: () => TRow
  readonly duplicateRow?: (opts: { rowData: TRow; rowIndex: number }) => TRow
  readonly autoAddRow?: boolean
  readonly lockRows?: boolean
  readonly disableContextMenu?: boolean
  readonly disableExpandSelection?: boolean
  readonly disableSmartDelete?: boolean
  readonly onFocus?: (opts: { cell: CellWithId }) => void
  readonly onBlur?: (opts: { cell: CellWithId }) => void
  readonly onActiveCellChange?: (opts: { cell: CellWithId | null }) => void
  readonly onSelectionChange?: (opts: { selection: SelectionWithId | null }) => void
}

interface CellWithIdInput {
  readonly col: number | string
  readonly row: number
}

type SelectionWithIdInput = { readonly min: CellWithIdInput; readonly max: CellWithIdInput }

export interface CellWithId {
  readonly colId?: string
  readonly col: number
  readonly row: number
}

export interface SelectionWithId { readonly min: CellWithId; readonly max: CellWithId }

export interface DataSheetGridRef {
  readonly activeCell: CellWithId | null
  readonly selection: SelectionWithId | null
  readonly setActiveCell: (activeCell: CellWithIdInput | null) => void
  readonly setSelection: (selection: SelectionWithIdInput | null) => void
}

export interface SelectionMode {
  readonly columns: boolean;
  readonly rows: boolean;
  readonly active: boolean;
}
