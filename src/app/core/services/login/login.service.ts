import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { AuthApiError, AuthUser, LoginRequest } from '../../models/login/login.models';
import accounts from './demo-accounts.json';

interface DemoUser {
  email: string;
  name: string;
  roles: string[];
  method: string;
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
      if (Array.isArray(saved))
        this.users.push(
          ...saved.filter((user) => !this.users.some((item) => item.email === user.email)),
        );
    } catch {
      /* Use supplied dummy accounts when browser storage is unavailable. */
    }
  }
  login(request: LoginRequest): Observable<AuthUser> {
    return timer(650).pipe(
      map(() => {
        const email = request.email.trim().toLowerCase();
        const user = this.users.find((item) => item.email === email);
        if (!user || request.password !== (this.passwords[email] || accounts.password))
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
  upsertDemoUser(email: string, name: string, roles: string[], method: string): void {
    if (!email || !roles.length) return;
    email = email.trim().toLowerCase();
    const user = { email, name, roles: [...roles], method };
    const extra = this.users.filter(
      (item) =>
        !accounts.accounts.some((seed) => seed.email === item.email) && item.email !== email,
    );
    const updated = [...accounts.accounts.filter((seed) => seed.email !== email), ...extra, user];
    localStorage.setItem('ngage-demo-users', JSON.stringify([...extra, user]));
    this.users = updated;
  }
}
