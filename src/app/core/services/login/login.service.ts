import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { AuthApiError, AuthUser, LoginRequest } from '../../models/login/login.models';
import accounts from './demo-accounts.json';

interface DemoUser {
  email: string;
  name: string;
  roles: string[];
  method: string;
  status?: string;
}
export const DEMO_CREDENTIALS: LoginRequest = {
  email: 'superadmin@demo.local',
  password: accounts.password,
};

/** Demo-only data adapter. Replace login with the authenticated API when available. */
@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly passwords: Record<string, string> = {};
  users: DemoUser[] = [...accounts.accounts];
  constructor() {
    try {
      const saved: DemoUser[] = JSON.parse(localStorage.getItem('ngage-demo-users') || '[]');
      if (Array.isArray(saved)) {
        const merged = new Map(this.users.map((user) => [user.email, user]));
        for (const user of saved) if (user.email) merged.set(user.email.trim().toLowerCase(), user);
        this.users = [...merged.values()];
      }
    } catch {
      /* Use supplied dummy accounts when browser storage is unavailable. */
    }
  }
  login(request: LoginRequest): Observable<AuthUser> {
    return timer(650).pipe(
      map(() => {
        const email = request.email.trim().toLowerCase();
        const user = this.users.find((item) => item.email === email);
        if (
          !user ||
          !user.roles.length ||
          user.status === 'Pending' ||
          user.status === 'Disabled' ||
          request.password !== (this.passwords[email] || accounts.password)
        )
          throw new AuthApiError('invalid-credentials');
        return { id: email, name: user.name, email, role: user.roles[0], roles: [...user.roles] };
      }),
    );
  }
  changePassword(email: string, current: string, next: string, confirmation: string): string {
    if (current !== (this.passwords[email] || accounts.password))
      return 'Current password is incorrect.';
    if (next.length < 8) return 'Use at least 8 characters for this demo.';
    if (next !== confirmation) return 'New passwords do not match.';
    this.passwords[email] = next;
    return '';
  }
  upsertDemoUser(
    email: string,
    name: string,
    roles: string[],
    method: string,
    status?: string,
  ): void {
    if (!email) return;
    email = email.trim().toLowerCase();
    const previous = this.users.find((user) => user.email === email);
    const user = {
      email,
      name,
      roles: [...new Set(roles)],
      method,
      status: status || previous?.status || 'Active',
    };
    const updated = [...this.users.filter((item) => item.email !== email), user];
    localStorage.setItem('ngage-demo-users', JSON.stringify(updated));
    this.users = updated;
  }
  setUserStatus(email: string, status: string): void {
    const user = this.users.find((item) => item.email === email.toLowerCase());
    if (!user) return;
    const updated = this.users.map((item) => (item === user ? { ...item, status } : item));
    localStorage.setItem('ngage-demo-users', JSON.stringify(updated));
    this.users = updated;
  }
  renameRole(previous: string, next: string): void {
    const updated = this.users.map((user) => ({
      ...user,
      roles: user.roles.map((role) => (role === previous ? next : role)),
    }));
    localStorage.setItem('ngage-demo-users', JSON.stringify(updated));
    this.users = updated;
  }
}
