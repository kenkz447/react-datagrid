import { CellProps } from '@basestacks/react-datagrid';

export function TextCell(props: CellProps<string | number>) {
    const { value } = props;

    return (
        <input
            defaultValue={value}
            tabIndex={-1}
        />
    );
}
