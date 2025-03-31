import React from 'react';

export const routes = [{
    path: '/example',
    title: 'Example',
    Component: React.lazy(() => import('./pages/example')),
}];
