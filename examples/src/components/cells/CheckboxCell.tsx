import { CellProps } from '@basestacks/react-datagrid';

export function CheckboxCell(props: CellProps<boolean>) {
    const { value } = props;

    return (
        <input
            type="checkbox"
            defaultChecked={value}
            tabIndex={-1}
        />
    );
}
