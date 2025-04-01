import { useRef, useLayoutEffect, useEffect } from 'react';
import { CellProps } from '../../types';
import { useFirstRender } from '../../hooks/internal/useFirstRender';
import cx from 'classnames';

export type TextColumnData<T> = {
    placeholder?: string
    alignRight: boolean
    continuousUpdates: boolean
    parseUserInput: (value: string) => T
    formatBlurredInput: (value: T) => string
    formatInputOnFocus: (value: T) => string
}

export function TextCell({
    active,
    focus,
    rowData,
    setRowData,
    columnData: {
        placeholder,
        alignRight,
        formatInputOnFocus,
        formatBlurredInput,
        parseUserInput,
        continuousUpdates,
    },
}: CellProps<string, TextColumnData<string>>) {
    const ref = useRef<HTMLInputElement>(null);
    const firstRender = useFirstRender();

    // We create refs for async access so we don't have to add it to the useEffect dependencies
    const asyncRef = useRef({
        rowData,
        formatInputOnFocus,
        formatBlurredInput,
        setRowData,
        parseUserInput,
        continuousUpdates,
        firstRender,
        // Timestamp of last focus (when focus becomes true) and last change (input change)
        // used to prevent un-necessary updates when value was not changed
        focusedAt: 0,
        changedAt: 0,
        // This allows us to keep track of whether or not the user blurred the input using the Esc key
        // If the Esc key is used we do not update the row's value (only relevant when continuousUpdates is false)
        escPressed: false,
    });
    asyncRef.current = {
        rowData,
        formatInputOnFocus,
        formatBlurredInput,
        setRowData,
        parseUserInput,
        continuousUpdates,
        firstRender,
        // Keep the same values across renders
        focusedAt: asyncRef.current.focusedAt,
        changedAt: asyncRef.current.changedAt,
        escPressed: asyncRef.current.escPressed,
    };

    useLayoutEffect(() => {
        // When the cell gains focus we make sure to immediately select the text in the input:
        // - If the user gains focus by typing, it will replace the existing text, as expected
        // - If the user gains focus by clicking or pressing Enter, the text will be preserved and selected
        if (focus) {
            if (ref.current) {
                // Make sure to first format the input
                ref.current.value = asyncRef.current.formatInputOnFocus(
                    asyncRef.current.rowData
                );
                ref.current.focus();
                ref.current.select();
            }

            // We immediately reset the escPressed
            asyncRef.current.escPressed = false;
            // Save current timestamp
            asyncRef.current.focusedAt = Date.now();
        }
        // When the cell looses focus (by pressing Esc, Enter, clicking away...) we make sure to blur the input
        // Otherwise the user would still see the cursor blinking
        else {
            if (ref.current) {
                // Update the row's value on blur only if the user did not press escape (only relevant when continuousUpdates is false)
                if (
                    !asyncRef.current.escPressed &&
                    !asyncRef.current.continuousUpdates &&
                    !asyncRef.current.firstRender &&
                    // Make sure that focus was gained more than 10 ms ago, used to prevent flickering
                    asyncRef.current.changedAt >= asyncRef.current.focusedAt
                ) {
                    asyncRef.current.setRowData(
                        asyncRef.current.parseUserInput(ref.current.value)
                    );
                }
                ref.current.blur();
            }
        }
    }, [focus]);

    useEffect(() => {
        if (!focus && ref.current) {
            // On blur or when the data changes, format it for display
            ref.current.value = asyncRef.current.formatBlurredInput(rowData);
        }
    }, [focus, rowData]);

    return (
        <input
            // We use an uncontrolled component for better performance
            defaultValue={formatBlurredInput(rowData)}
            className={cx('dsg-input', alignRight && 'dsg-input-align-right')}
            placeholder={active ? placeholder : undefined}
            // Important to prevent any undesired "tabbing"
            tabIndex={-1}
            ref={ref}
            // Make sure that while the cell is not focus, the user cannot interact with the input
            // The cursor will not change to "I", the style of the input will not change,
            // and the user cannot click and edit the input (this part is handled by DataSheetGrid itself)
            style={{ pointerEvents: focus ? 'auto' : 'none' }}
            onChange={(e) => {
                asyncRef.current.changedAt = Date.now();

                // Only update the row's value as the user types if continuousUpdates is true
                if (continuousUpdates) {
                    setRowData(parseUserInput(e.target.value));
                }
            }}
            onKeyDown={(e) => {
                // Track when user presses the Esc key
                if (e.key === 'Escape') {
                    asyncRef.current.escPressed = true;
                }
            }}
        />
    );
}
