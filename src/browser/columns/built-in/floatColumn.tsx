import { createEditableColumn } from '../createEditableColumn';

export const floatColumn = createEditableColumn<number | null>({
    alignRight: true,
    formatBlurredInput: (value) =>
        typeof value === 'number' ? new Intl.NumberFormat().format(value) : '',
    parseUserInput: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? number : null;
    },
    parsePastedValue: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? number : null;
    },
});
