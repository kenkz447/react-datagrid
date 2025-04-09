import { useDatagridContext } from '@basestacks/react-datagrid';
import { cn } from '../utils/classnames';
import { useRows } from '../hooks/useRows';
import { Ref } from 'react';

const classNames = {
    table: 'w-full table-auto border-collapse text-sm',
    header: 'border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 dark:border-gray-600 dark:text-gray-200',
    body: 'bg-white dark:bg-gray-800',
    cell: 'border-b border-gray-100 p-4 pl-8 text-gray-500 dark:border-gray-700 dark:text-gray-400',
};

export function NewDatagrid() {
    const datagrid = useDatagridContext();
    const rows = useRows(datagrid);

    const { outerRef, innerRef, columns } = datagrid;

    return (
        <div ref={outerRef as Ref<HTMLDivElement>} className="my-8 overflow-hidden">
            <table ref={innerRef as Ref<HTMLTableElement>} className={cn(classNames.table)}>
                <thead>
                    <tr>
                        <th className={cn(classNames.header)}>
                            #
                        </th>
                        {columns.map((column) => (
                            <th key={column.id ?? '0'} className={cn(classNames.header)}>
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={cn(classNames.body)}>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={cn(classNames.cell)}>
                                {rowIndex + 1}
                            </td>
                            {row.cells.map((cell) => (
                                <td key={cell.key} className={cn(classNames.cell)}>
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
