import { Routes } from '@angular/router';

export const loginRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/login/login-layout').then((m) => m.LoginLayout),
    children: [
      {
        path: '',
        title: 'Sign in | EventFlow',
        loadComponent: () => import('./pages/login').then((m) => m.Login),
      },
    ],
  },
];
