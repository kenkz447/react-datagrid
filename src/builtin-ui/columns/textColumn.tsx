import { createEditableColumn } from '../../core';
import { TextCell } from '../components/cells/TextCell';

export const textColumn = createEditableColumn<string>(TextCell);
