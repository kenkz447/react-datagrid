import { Column } from '../../types';
import { CheckboxCell } from '../../components/cells/CheckboxCell';

// Those values are used when pasting values, all those values will be considered false, any other true
const FALSY = [
    '',
    'false',
    'no',
    'off',
    'disabled',
    '0',
    'n',
    'f',
    'unchecked',
    'undefined',
    'null',
    'wrong',
    'negative',
];

export const checkboxColumn: Partial<Column<boolean, any, string>> = {
    component: CheckboxCell,
    deleteValue: () => false,
    // We can customize what value is copied: when the checkbox is checked we copy YES, otherwise we copy NO
    copyValue: ({ rowData }) => (rowData ? 'YES' : 'NO'),
    // Since we copy custom values, we have to make sure pasting gives us the expected result
    // Here NO is included in the FALSY array, so it will be converted to false, YES is not, so it will be converted to true
    pasteValue: ({ value }) => !FALSY.includes(value.toLowerCase()),
    isCellEmpty: ({ rowData }) => !rowData,
};
