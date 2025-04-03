import { AddRows, checkboxColumn, ContextMenu, DatagridProvider, Datagrid, keyColumn, textColumn, useDatagrid } from '@basestacks/react-datagrid';
import { useState } from 'react';

export default function Example() {
    const [data, setData] = useState([
        { active: true, firstName: 'Elon', lastName: 'Musk' },
        { active: false, firstName: 'Jeff', lastName: 'Bezos' },
    ]);

    const columns = [
        { ...keyColumn('active', checkboxColumn), title: 'Active' },
        { ...keyColumn('firstName', textColumn), title: 'First name' },
        { ...keyColumn('lastName', textColumn), title: 'Last name' },
    ];

    const datagrid = useDatagrid({
        columns,
        data,
        onChange: setData as any,
    });

    return (
        <div>
            <h1>Index</h1>
            <DatagridProvider {...datagrid}>
                <Datagrid />
                <AddRows />
                <ContextMenu />
            </DatagridProvider>
        </div>
    );
};
