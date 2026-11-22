import { computed, inject, Injectable, signal } from '@angular/core';
import {
  defer,
  finalize,
  Observable,
  Subject,
  take,
  takeUntil,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { LoginService } from './login.service';
import {
  AuthApiError,
  AuthUser,
  LoginRequest,
  SessionStatus,
} from '../../models/login/login.models';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly api = inject(LoginService);
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly currentStatus = signal<SessionStatus>('anonymous');
  private readonly logoutRequested = new Subject<void>();

  readonly user = this.currentUser.asReadonly();
  readonly status = this.currentStatus.asReadonly();
  readonly isAuthenticated = computed(
    () => this.status() === 'authenticated' && this.user() !== null,
  );

  login(request: LoginRequest): Observable<AuthUser> {
    return defer(() => {
      if (this.status() === 'authenticating') {
        return throwError(() => new AuthApiError('request-in-progress'));
      }

      this.currentUser.set(null);
      this.currentStatus.set('authenticating');

      return defer(() => this.api.login(request)).pipe(
        timeout(10_000),
        take(1),
        takeUntil(this.logoutRequested),
        tap({
          next: (user) => {
            this.currentUser.set(user);
            this.currentStatus.set('authenticated');
          },
          error: () => this.currentStatus.set('failed'),
        }),
        finalize(() => {
          if (this.status() === 'authenticating') {
            this.currentStatus.set('anonymous');
          }
        }),
      );
    });
  }

  logout(): void {
    this.logoutRequested.next();
    this.currentUser.set(null);
    this.currentStatus.set('anonymous');
  }
}
