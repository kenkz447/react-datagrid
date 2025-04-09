import { useDatagridContext } from '@basestacks/react-datagrid';
import { cn } from '../utils/classnames';

const classNames = {
    table: 'w-full table-auto border-collapse text-sm',
    header: 'border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 dark:border-gray-600 dark:text-gray-200',
    body: 'bg-white dark:bg-gray-800',
    cell: 'border-b border-gray-100 p-4 pl-8 text-gray-500 dark:border-gray-700 dark:text-gray-400',
};

export function NewDatagrid() {
    const datagrid = useDatagridContext();
    const { outerRef, innerRef, columns, data } = datagrid;

    return (
        <div ref={outerRef} className="my-8 overflow-hidden">
            <table ref={innerRef} className={cn(classNames.table)}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.id ?? '0'} className={cn(classNames.header)}>
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={cn(classNames.body)}>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column, columnIndex) => {
                                const Cell = column.component;
                                
                                return (
                                    <td key={columnIndex} className={cn(classNames.cell)}>
                                        <Cell
                                            rowData={row[column.id]}
                                            rowIndex={rowIndex}
                                            columnData={column.columnData}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
