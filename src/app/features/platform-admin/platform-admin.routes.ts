import { Routes } from '@angular/router';

export const platformAdminRoutes: Routes = [
  {
    path: '',
    title: 'Platform Admin | Shobiz',
    loadComponent: () =>
      import('../../layouts/platform-admin/platform-admin').then((m) => m.WorkspaceComponent),
  },
];
