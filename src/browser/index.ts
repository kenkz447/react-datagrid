import {
    Column as ColumnBase,
    CellComponent as CellComponentBase,
    CellProps as CellPropsBase,
    DataSheetGridProps as DataSheetGridPropsBase,
    AddRowsComponentProps as AddRowsComponentPropsBase,
    SimpleColumn as SimpleColumnBase,
    ContextMenuComponentProps as ContextMenuComponentPropsBase,
    ContextMenuItem as ContextMenuItemBase,
    DataSheetGridRef as DataSheetGridRefBase,
} from '../core/types';

export type Column<T = any, C = any, PasteValue = string> = Partial<
  ColumnBase<T, C, PasteValue>
>
export type CellComponent<T = any, C = any> = CellComponentBase<T, C>
export type CellProps<T = any, C = any> = CellPropsBase<T, C>
export type DataSheetGridProps<T = any> = DataSheetGridPropsBase<T>
export type AddRowsComponentProps = AddRowsComponentPropsBase
export type SimpleColumn<T = any, C = any> = SimpleColumnBase<T, C>
export type ContextMenuComponentProps = ContextMenuComponentPropsBase
export type ContextMenuItem = ContextMenuItemBase
export type DataSheetGridRef = DataSheetGridRefBase

export { DataSheetGrid } from './components/DataSheetGrid';
export { createEditableColumn } from './columns/createEditableColumn';
export { textColumn } from './columns/built-in/textColumn';
export { checkboxColumn } from './columns/built-in/checkboxColumn';
export { floatColumn } from './columns/built-in/floatColumn';
export { intColumn } from './columns/built-in/intColumn';
export { percentColumn } from './columns/built-in/percentColumn';
export { dateColumn } from './columns/built-in/dateColumn';
export { isoDateColumn } from './columns/built-in/isoDateColumn';
export { keyColumn } from './columns/keyColumn';
export { createAddRowsComponent } from './components/AddRows';
export {
    createContextMenuComponent,
    defaultRenderItem as renderContextMenuItem,
} from './components/ContextMenu';
