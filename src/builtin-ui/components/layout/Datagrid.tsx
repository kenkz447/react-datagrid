import { Grid } from './Grid';
import { SelectionRect } from './SelectionRect';
import { TabIndexBefore } from './TabIndexBefore';
import { TabIndexAfter } from './TabIndexAfter';

export function Datagrid(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props}>
            <TabIndexBefore />
            <Grid>
                <SelectionRect />
            </Grid>
            <TabIndexAfter />
        </div>
    );
};
