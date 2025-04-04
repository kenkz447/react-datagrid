import { Grid } from './Grid';

export function Datagrid(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props}>
            <Grid />
        </div>
    );
};
