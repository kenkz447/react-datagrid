import React from 'react';

export type Cell = {
  readonly col: number
  readonly row: number
}


export type ScrollBehavior = {
  readonly doNotScrollX?: boolean
  readonly doNotScrollY?: boolean
}

export type Selection = { readonly min: Cell; readonly max: Cell }

export type RowData = Record<string, any>;

export type CellProps<T, C> = {
  readonly rowData: T
  readonly rowIndex: number
  readonly columnIndex: number
  readonly active: boolean
  readonly focus: boolean
  readonly disabled: boolean
  readonly columnData: C
  readonly setRowData: (rowData: T) => void
  readonly stopEditing: (opts?: { nextRow?: boolean }) => void
  readonly insertRowBelow: () => void
  readonly duplicateRow: () => void
  readonly deleteRow: () => void
  readonly getContextMenuItems: () => ContextMenuItem[]
}

export type CellComponent<T, C> = (props: CellProps<T, C>) => React.JSX.Element

export type Column<TValue, C, PasteValue> = {
  readonly id?: string
  readonly headerClassName?: string
  readonly title?: React.ReactNode
  /** @deprecated Use `basis`, `grow`, and `shrink` instead */
  readonly width?: string | number
  readonly basis: number
  readonly grow: number
  readonly shrink: number
  readonly minWidth: number
  readonly maxWidth?: number
  readonly component: CellComponent<TValue, C>
  readonly columnData?: C
  readonly disableKeys: boolean
  readonly disabled: boolean | ((opt: { rowData: TValue; rowIndex: number }) => boolean)
  readonly cellClassName?:
    | string
    | ((opt: {
        rowData: TValue
        rowIndex: number
        columnId?: string
      }) => string | undefined)
  readonly keepFocus: boolean
  readonly deleteValue: (opt: { rowData: TValue; rowIndex: number }) => TValue
  readonly copyValue: (opt: { rowData: TValue; rowIndex: number }) => number | string | null
  readonly pasteValue: (opt: { rowData: TValue; value: PasteValue; rowIndex: number }) => TValue
  readonly prePasteValues: (values: string[]) => PasteValue[] | Promise<PasteValue[]>
  readonly isCellEmpty: (opt: { rowData: TValue; rowIndex: number }) => boolean
}

export type SelectionContextType = {
  readonly columnRights?: number[]
  readonly columnWidths?: number[]
  readonly activeCell: Cell | null
  readonly selection: Selection | null
  readonly dataLength: number
  readonly rowHeight: (index: number) => { height: number; top: number }
  readonly hasStickyRightColumn: boolean
  readonly editing: boolean
  readonly isCellDisabled: (cell: Cell) => boolean
  readonly headerRowHeight: number
  readonly viewWidth?: number
  readonly viewHeight?: number
  readonly contentWidth?: number
  readonly edges: { readonly top: boolean; readonly right: boolean; readonly bottom: boolean; readonly left: boolean }
  readonly expandSelection: number | null
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

export type AddRowsComponentProps = {
  readonly addRows: (count?: number) => void
}

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

export type ContextMenuComponentProps = {
  readonly clientX: number
  readonly clientY: number
  readonly items: ContextMenuItem[]
  readonly cursorIndex: Cell
  readonly close: () => void
}

export type Operation = {
  readonly type: 'UPDATE' | 'DELETE' | 'CREATE'
  readonly fromRowIndex: number
  readonly toRowIndex: number
}

export type DataSheetGridProps<T> = {
  readonly data?: T[]
  readonly style?: React.CSSProperties
  readonly className?: string
  readonly rowClassName?:
    | string
    | ((opt: { rowData: T; rowIndex: number }) => string | undefined)
  readonly cellClassName?:
    | string
    | ((opt: {
        rowData: unknown
        rowIndex: number
        columnId?: string
      }) => string | undefined)
  readonly onChange?: (value: T[], operations: Operation[]) => void
  readonly columns?: Partial<Column<T, any, any>>[]
  readonly gutterColumn?: SimpleColumn<T, any> | false
  readonly stickyRightColumn?: SimpleColumn<T, any>
  readonly rowKey?: string | ((opts: { rowData: T; rowIndex: number }) => string)
  readonly height?: number
  readonly rowHeight?: number | ((opt: { rowData: T; rowIndex: number }) => number)
  readonly headerRowHeight?: number
  readonly addRowsComponent?:
    | ((props: AddRowsComponentProps) => React.ReactElement | null)
    | false
  readonly createRow?: () => T
  readonly duplicateRow?: (opts: { rowData: T; rowIndex: number }) => T
  readonly autoAddRow?: boolean
  readonly lockRows?: boolean
  readonly disableContextMenu?: boolean
  readonly disableExpandSelection?: boolean
  readonly disableSmartDelete?: boolean
  readonly contextMenuComponent?: (
    props: ContextMenuComponentProps
  ) => React.ReactElement | null
  readonly onFocus?: (opts: { cell: CellWithId }) => void
  readonly onBlur?: (opts: { cell: CellWithId }) => void
  readonly onActiveCellChange?: (opts: { cell: CellWithId | null }) => void
  readonly onSelectionChange?: (opts: { selection: SelectionWithId | null }) => void
  readonly onScroll?: React.UIEventHandler<HTMLDivElement> | undefined
}

type CellWithIdInput = {
  readonly col: number | string
  readonly row: number
}

type SelectionWithIdInput = { readonly min: CellWithIdInput; readonly max: CellWithIdInput }

export type CellWithId = {
  readonly colId?: string
  readonly col: number
  readonly row: number
}

export type SelectionWithId = { readonly min: CellWithId; readonly max: CellWithId }

export type DataSheetGridRef = {
  readonly activeCell: CellWithId | null
  readonly selection: SelectionWithId | null
  readonly setActiveCell: (activeCell: CellWithIdInput | null) => void
  readonly setSelection: (selection: SelectionWithIdInput | null) => void
}
