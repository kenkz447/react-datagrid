import { CellProps, Column } from '../types';

type CreateEditableColumnOptions<TCell> = {
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

export function createEditableColumn<TCell>(
    Component: React.ComponentType<CellProps<TCell, any>>,
    options: CreateEditableColumnOptions<TCell> = {}
): Partial<Column<TCell, any, any>> {
    const {
        placeholder,
        alignRight = false,
        continuousUpdates = true,
        deletedValue = null,
        parseUserInput = (value) => (value.trim() || null),
        formatBlurredInput = (value) => String(value ?? ''),
        formatInputOnFocus = (value) => String(value ?? ''),
        formatForCopy = (value) => String(value ?? ''),
        parsePastedValue = (value) => (value.replace(/[\n\r]+/g, ' ').trim() || (null)),
    } = options;

    return {
        component: Component,
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
        pasteValue: ({ value }) => parsePastedValue(value) as any,
        isCellEmpty: ({ rowData }) => rowData === null || rowData === undefined,
    };
}
