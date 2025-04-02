import { Column } from '../../../core';
import { IsoDateCell } from '../../components/cells/IsoDateCell';

export const isoDateColumn: Partial<Column<string | null, any, string>> = {
    component: IsoDateCell,
    deleteValue: () => null,
    copyValue: ({ rowData }) => rowData,
    // Because the Date constructor works using iso format, we can use it to parse ISO string back to a Date object
    pasteValue: ({ value }) => {
        const date = new Date(value.replace(/\.\s?|\//g, '-'));
        return isNaN(date.getTime()) ? null : date.toISOString().substr(0, 10);
    },
    minWidth: 170,
    isCellEmpty: ({ rowData }) => !rowData,
};
