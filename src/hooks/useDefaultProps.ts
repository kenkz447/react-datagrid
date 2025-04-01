import {
    DEFAULT_COLUMNS,
    DEFAULT_CREATE_ROW,
    DEFAULT_DATA,
    DEFAULT_DUPLICATE_ROW,
    DEFAULT_EMPTY_CALLBACK
} from '../constants';
import { DataSheetGridProps, RowData } from '../types';

const defaultProps: DataSheetGridProps<any> = {
    autoAddRow: false,
    lockRows: false,
    disableExpandSelection: false,
    disableSmartDelete: false,
    disableContextMenu: false,
    columns: DEFAULT_COLUMNS,
    data: DEFAULT_DATA,
    height: 400,
    rowHeight: 40,
    headerRowHeight: 40,
    duplicateRow: DEFAULT_DUPLICATE_ROW,
    onFocus: DEFAULT_EMPTY_CALLBACK,
    onBlur: DEFAULT_EMPTY_CALLBACK,
    onActiveCellChange: DEFAULT_EMPTY_CALLBACK,
    onSelectionChange: DEFAULT_EMPTY_CALLBACK,
    createRow: DEFAULT_CREATE_ROW,
    onChange: DEFAULT_EMPTY_CALLBACK,
};

export const useDefaultProps = <TRow extends RowData>(props: DataSheetGridProps<TRow>) => {
    return {
        ...defaultProps,
        ...props,
        headerRowHeight: typeof props.rowHeight === 'number' ? props.rowHeight : 40,
    } as Required<DataSheetGridProps<TRow>>;
};
