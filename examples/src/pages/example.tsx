import { checkboxColumn, DatagridProvider, keyColumn, textColumn, useDatagrid, Grid } from '@basestacks/react-datagrid';
import { useState } from 'react';
import { ContextMenu } from '../components/ContextMenu';
import { AddRows } from '../components/AddRows';


const columns = [
    { ...keyColumn('active', checkboxColumn), title: 'Active' },
    { ...keyColumn('firstName', textColumn), title: 'First name' },
    { ...keyColumn('lastName', textColumn), title: 'Last name' },
];

export default function Example() {
    const [data, setData] = useState([
        { active: true, firstName: 'Elon', lastName: 'Musk' },
        { active: false, firstName: 'Jeff', lastName: 'Bezos' },
    ]);

    const datagrid = useDatagrid({
        columns,
        data,
        onChange: setData as any,
    });

    return (
        <div>
            <h1>Index</h1>
            <DatagridProvider {...datagrid}>
                <Grid />
                <AddRows />
                <ContextMenu />
            </DatagridProvider>
        </div>
    );
};
