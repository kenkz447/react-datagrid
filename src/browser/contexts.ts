import { createContext } from 'react';
import { UseDatagridReturn } from './hooks/useDatagrid';

export const DatagridContext = createContext<UseDatagridReturn<any>>(null!);
