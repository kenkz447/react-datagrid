import { Column } from '../../core';
import { DateCell } from '../components/cells/DateCell';


export const dateColumn: Partial<Column<Date | null, any, string>> = {
    component: DateCell,
    deleteValue: () => null,
    // We convert the date to a string for copying using toISOString
    copyValue: ({ rowData }) =>
        rowData ? rowData.toISOString().substr(0, 10) : null,
    // Because the Date constructor works using iso format, we can use it to parse ISO string back to a Date object
    pasteValue: ({ value }) => {
        const date = new Date(value.replace(/\.\s?|\//g, '-'));
        return isNaN(date.getTime()) ? null : date;
    },
    minWidth: 170,
    isCellEmpty: ({ rowData }) => !rowData,
};
