import React from 'react';

export const routes = [{
    path: '/new-example',
    title: 'Example(with tailwind)',
    Component: React.lazy(() => import('./pages/new-example')),
}];
