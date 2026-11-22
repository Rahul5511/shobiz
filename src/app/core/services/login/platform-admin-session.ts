import { inject, Injectable } from '@angular/core';
import { AuthSession } from './auth-session.service';
import { LoginService } from './login.service';

/** Compatibility boundary for the supplied workspace. AuthSession remains the session owner. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(AuthSession);
  private readonly api = inject(LoginService);
  get session() {
    return this.auth.user();
  }
  get users() {
    return this.api.users;
  }
  logout() {
    this.auth.logout();
  }
  changePassword(current: string, next: string, confirmation: string): string {
    const user = this.session;
    return user
      ? this.api.changePassword(user.email, current, next, confirmation)
      : 'Sign in first.';
  }
  upsertDemoUser(email: string, name: string, roles: string[], method: string): void {
    this.api.upsertDemoUser(email, name, roles, method);
  }
}
