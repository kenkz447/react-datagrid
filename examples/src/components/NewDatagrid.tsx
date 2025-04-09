import { useDatagridContext } from '@basestacks/react-datagrid';
import { cn } from '../utils/classnames';
import { useRows } from '../hooks/useRows';
import { tableCns } from '../constants';

export function NewDatagrid() {
    const datagrid = useDatagridContext();

    const rows = useRows(datagrid);

    const { columns } = datagrid;

    return (
        <div className="my-8 overflow-hidden">
            <table className={cn(tableCns.table)}>
                <thead>
                    <tr>
                        <th className={cn(tableCns.header)}>#</th>
                        {columns.map((column) => (
                            <th key={column.id ?? '0'} className={cn(tableCns.header)}>
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={cn(tableCns.body)}>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={cn(tableCns.cell)}>
                                {rowIndex + 1}
                            </td>
                            {row.cells.map((cell) => (
                                <td key={cell.key} className={cn(tableCns.cell)}>
                                    {cell.render()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
