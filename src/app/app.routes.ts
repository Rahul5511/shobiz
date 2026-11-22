import { Routes } from '@angular/router';
import { authGuard, guestGuard, platformAdminGuard } from './core/guards/login/login-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'app',
    canActivate: [authGuard, platformAdminGuard],
    loadChildren: () =>
      import('./features/platform-admin/platform-admin.routes').then((m) => m.platformAdminRoutes),
  },
  ...['forgot-password', 'reset-password', 'verify-email'].map((path) => ({
    path,
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/pages/recovery').then((m) => m.Recovery),
    data: { mode: path },
  })),
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/login/login.routes').then((m) => m.loginRoutes),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/admin/admin-layout').then((m) => m.AdminLayout),
    loadChildren: () => import('./features/events/events.routes').then((m) => m.eventsRoutes),
  },
  {
    path: ':client/:event/registration',
    title: 'Event registration | Shobiz',
    loadComponent: () =>
      import('./features/events/pages/public-registration/public-registration').then(
        (m) => m.PublicComponent,
      ),
  },
  {
    path: '**',
    title: 'Page not found | EventFlow',
    loadComponent: () => import('./shared/components/not-found/not-found').then((m) => m.NotFound),
  },
];
