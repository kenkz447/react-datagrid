import { createEditableColumn } from '../../core';
import { TextCell } from '../components/cells/TextCell';

export const intColumn = createEditableColumn<number>(TextCell, {
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
