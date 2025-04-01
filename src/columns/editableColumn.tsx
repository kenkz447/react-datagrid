import { TextCell } from '../components/cells/TextCell';

type EditableColumnOptions<TCell> = {
    placeholder?: string;
    alignRight?: boolean;
    // When true, data is updated as the user types, otherwise it is only updated on blur. Default to true
    continuousUpdates?: boolean;
    // Value to use when deleting the cell
    deletedValue?: TCell;
    // Parse what the user types
    parseUserInput?: (value: string) => TCell;
    // Format the value of the input when it is blurred
    formatBlurredInput?: (value: TCell) => string;
    // Format the value of the input when it gets focused
    formatInputOnFocus?: (value: TCell) => string;
    // Format the value when copy
    formatForCopy?: (value: TCell) => string;
    // Parse the pasted value
    parsePastedValue?: (value: string) => TCell;
}

export function editableColumn<TCell>(options: EditableColumnOptions<TCell> = {}) {
    const {
        placeholder,
        alignRight = false,
        continuousUpdates = true,
        deletedValue = null,
        parseUserInput = (value) => (value.trim() || null),
        formatBlurredInput = (value) => String(value ?? ''),
        formatInputOnFocus = (value) => String(value ?? ''),
        formatForCopy = (value) => String(value ?? ''),
        parsePastedValue = (value) => (value.replace(/[\n\r]+/g, ' ').trim() || (null as unknown)),
    } = options;

    return {
        component: TextCell,
        columnData: {
            placeholder,
            alignRight,
            continuousUpdates,
            formatInputOnFocus,
            formatBlurredInput,
            parseUserInput,
        },
        deleteValue: () => deletedValue,
        copyValue: ({ rowData }) => formatForCopy(rowData),
        pasteValue: ({ value }) => parsePastedValue(value),
        isCellEmpty: ({ rowData }) => rowData === null || rowData === undefined,
    };
}
