import React from 'react';
import cx from 'classnames';

interface CellProps {
    readonly gutter: boolean;
    readonly stickyRight: boolean;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly active?: boolean;
    readonly children?: React.ReactNode;
    readonly width: number;
    readonly left: number;
}

export function Cell({
    children,
    gutter,
    stickyRight,
    active,
    disabled,
    className,
    width,
    left,
}: CellProps) {
    return (
        <div
            className={cx(
                'dsg-cell',
                gutter && 'dsg-cell-gutter',
                disabled && 'dsg-cell-disabled',
                gutter && active && 'dsg-cell-gutter-active',
                stickyRight && 'dsg-cell-sticky-right',
                className
            )}
            style={{
                width,
                left: stickyRight ? undefined : left,
            }}
        >
            {children}
        </div>
    );
};
