import { DatagridProvider, useDatagrid } from '@basestacks/react-datagrid';
import { useState } from 'react';
import { NewDatagrid } from '../components/NewDatagrid';
import { CheckboxCell } from '../components/cells/CheckboxCell';
import { textColumn } from '../components/cells/TextCell';

const columns = [
    { id: 'active', component: CheckboxCell, title: 'Active' },
    { id: 'firstName', title: 'First name', ...textColumn },
    { id: 'lastName', title: 'Last name', ...textColumn }
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
        <div className="prose p-8">
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-gray-950 dark:text-white">
                Table
            </h1>
            <p className="mt-6 text-base/7 text-gray-700 dark:text-gray-400">
                This is a new example of the datagrid with tailwind css.
            </p>
            <div className="mt-10">
                <div className="flex flex-col gap-1 rounded-xl bg-gray-950/5 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10">
                    <div className="not-prose overflow-auto rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50">
                        <DatagridProvider {...datagrid}>
                            <NewDatagrid />
                        </DatagridProvider>
                    </div>
                </div>
            </div>
        </div>
    );
};
