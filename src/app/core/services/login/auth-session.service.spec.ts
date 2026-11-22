import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LoginService, DEMO_CREDENTIALS } from './login.service';
import { AuthSession } from './auth-session.service';
import { AuthApiError, AuthUser } from '../../models/login/login.models';

describe('AuthSession', () => {
  let session: AuthSession;
  let response: Subject<AuthUser>;
  let api: { login: ReturnType<typeof vi.fn> };
  const user: AuthUser = { id: '1', name: 'Test Organiser', email: DEMO_CREDENTIALS.email };

  beforeEach(() => {
    response = new Subject<AuthUser>();
    api = { login: vi.fn(() => response.asObservable()) };
    TestBed.configureTestingModule({ providers: [{ provide: LoginService, useValue: api }] });
    session = TestBed.inject(AuthSession);
  });

  afterEach(() => vi.useRealTimers());

  it('starts anonymous and authenticates only after the API responds', () => {
    expect(session.status()).toBe('anonymous');
    expect(session.isAuthenticated()).toBe(false);
    session.login(DEMO_CREDENTIALS).subscribe();
    expect(session.status()).toBe('authenticating');
    expect(session.user()).toBeNull();
    response.next(user);
    expect(session.status()).toBe('authenticated');
    expect(session.user()).toEqual(user);
  });

  it('rejects duplicate pending requests without disturbing the first request', () => {
    session.login(DEMO_CREDENTIALS).subscribe();
    const error = vi.fn();
    session.login(DEMO_CREDENTIALS).subscribe({ error });
    expect(api.login).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(new AuthApiError('request-in-progress'));
    expect(session.status()).toBe('authenticating');
    response.next(user);
    expect(session.isAuthenticated()).toBe(true);
  });

  it('fails closed after a failed login and allows a retry', () => {
    session.login(DEMO_CREDENTIALS).subscribe({ error: () => undefined });
    response.error(new AuthApiError('invalid-credentials'));
    expect(session.status()).toBe('failed');
    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
    response = new Subject<AuthUser>();
    session.login(DEMO_CREDENTIALS).subscribe();
    response.next(user);
    expect(session.isAuthenticated()).toBe(true);
  });

  it('clears the identity on logout', () => {
    session.login(DEMO_CREDENTIALS).subscribe();
    response.next(user);
    session.logout();
    expect(session.status()).toBe('anonymous');
    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
  });

  it('cancels a pending request on logout so a late response cannot restore the session', () => {
    session.login(DEMO_CREDENTIALS).subscribe();
    session.logout();
    response.next(user);
    expect(response.observed).toBe(false);
    expect(session.isAuthenticated()).toBe(false);
    expect(session.user()).toBeNull();
  });

  it('returns to anonymous when the login page cancels its request', () => {
    const subscription = session.login(DEMO_CREDENTIALS).subscribe();
    subscription.unsubscribe();
    expect(response.observed).toBe(false);
    expect(session.status()).toBe('anonymous');
  });

  it('bounds a stalled API request without retrying it', async () => {
    vi.useFakeTimers();
    const error = vi.fn();
    session.login(DEMO_CREDENTIALS).subscribe({ error });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(error).toHaveBeenCalledTimes(1);
    expect(session.status()).toBe('failed');
    expect(response.observed).toBe(false);
    expect(api.login).toHaveBeenCalledTimes(1);
  });
});
