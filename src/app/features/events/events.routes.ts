import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  {
    path: '',
    title: 'Your workspace | EventFlow',
    loadComponent: () => import('./pages/events').then((m) => m.Events),
  },
];
