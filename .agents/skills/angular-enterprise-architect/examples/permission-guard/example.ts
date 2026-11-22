import { Injectable, computed, inject, signal } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

export const permissions = {
  usersView: 'users.view',
  usersCreate: 'users.create',
  usersEdit: 'users.edit',
  usersDelete: 'users.delete',
  agenciesView: 'agencies.view',
  agenciesApprove: 'agencies.approve',
  reportsExport: 'reports.export',
  eventsView: 'events.view',
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

type Session =
  | { readonly status: 'loading' }
  | { readonly status: 'anonymous' }
  | { readonly status: 'error' }
  | { readonly status: 'authenticated'; readonly grants: ReadonlySet<Permission> };

@Injectable({ providedIn: 'root' })
export class Authorization {
  private readonly session = signal<Session>({ status: 'loading' });
  readonly status = computed(() => this.session().status);

  // Call only from the trusted session adapter after loading server-issued grants.
  setAuthenticated(grants: readonly Permission[]): void {
    this.session.set({ status: 'authenticated', grants: new Set(grants) });
  }

  beginSessionLoad(): void {
    this.session.set({ status: 'loading' });
  }

  setAnonymous(): void {
    this.session.set({ status: 'anonymous' });
  }

  setSessionError(): void {
    this.session.set({ status: 'error' });
  }

  has(permission: Permission): boolean {
    const session = this.session();
    return session.status === 'authenticated' && session.grants.has(permission);
  }
}

export function requirePermission(permission: Permission): CanMatchFn {
  return () => {
    const auth = inject(Authorization);
    const router = inject(Router);
    switch (auth.status()) {
      case 'authenticated':
        return auth.has(permission) || router.createUrlTree(['/unauthorized']);
      case 'anonymous':
        return router.createUrlTree(['/login']);
      case 'loading':
      case 'error':
        return router.createUrlTree(['/session-unavailable']);
    }
  };
}
