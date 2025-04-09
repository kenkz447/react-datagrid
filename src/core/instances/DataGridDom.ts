import { DataSheetGridProps as DataGridProps, RowData } from '../types';
import { DataGridCore } from './DataGridCore';

export class DataGridDom<TRow extends RowData = RowData> extends DataGridCore<TRow> {
    constructor(props: DataGridProps<TRow>) {
        super(props);
    }
};

