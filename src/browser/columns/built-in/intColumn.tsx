import { createEditableColumn } from '../createEditableColumn';

export const intColumn = createEditableColumn<number | null>({
    alignRight: true,
    formatBlurredInput: (value) =>
        typeof value === 'number' ? new Intl.NumberFormat().format(value) : '',
    parseUserInput: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? Math.round(number) : null;
    },
    parsePastedValue: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? Math.round(number) : null;
    },
});
