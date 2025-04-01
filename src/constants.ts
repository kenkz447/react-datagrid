import { Column, DataSheetGridProps } from './types';

export const DEFAULT_DATA: any[] = [];
export const DEFAULT_COLUMNS: Column<any, any, any>[] = [];
export const DEFAULT_CREATE_ROW: DataSheetGridProps<any>['createRow'] = () => ({});
export const DEFAULT_EMPTY_CALLBACK: () => void = () => null;
export const DEFAULT_DUPLICATE_ROW: DataSheetGridProps<any>['duplicateRow'] = ({ rowData }) => ({ ...rowData });

