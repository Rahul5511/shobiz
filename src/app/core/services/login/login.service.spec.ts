import { firstValueFrom } from 'rxjs';
import { AuthApiError } from '../../models/login/login.models';
import { DEMO_CREDENTIALS, LoginService } from './login.service';

describe('LoginService dummy login', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('simulates latency and returns a user without credentials', async () => {
    const result = firstValueFrom(new LoginService().login(DEMO_CREDENTIALS));
    let resolved = false;
    void result.then(() => (resolved = true));
    await vi.advanceTimersByTimeAsync(649);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toEqual({
      id: DEMO_CREDENTIALS.email,
      name: 'Platform Admin',
      role: 'Super User',
      roles: ['Super User'],
      email: DEMO_CREDENTIALS.email,
    });
  });

  it('normalizes email but treats the password as case sensitive', async () => {
    const api = new LoginService();
    const result = firstValueFrom(
      api.login({ ...DEMO_CREDENTIALS, email: ' SUPERADMIN@DEMO.LOCAL ' }),
    );
    await vi.advanceTimersByTimeAsync(650);
    expect((await result).email).toBe(DEMO_CREDENTIALS.email);

    const invalid = expect(
      firstValueFrom(api.login({ ...DEMO_CREDENTIALS, password: 'demo@123' })),
    ).rejects.toEqual(new AuthApiError('invalid-credentials'));
    await vi.advanceTimersByTimeAsync(650);
    await invalid;
  });

  it('rejects an unknown account', async () => {
    const invalid = expect(
      firstValueFrom(new LoginService().login({ ...DEMO_CREDENTIALS, email: 'other@example.com' })),
    ).rejects.toEqual(new AuthApiError('invalid-credentials'));
    await vi.advanceTimersByTimeAsync(650);
    await invalid;
  });

  it('uses the first assigned role and changes the demo password only in this service session', async () => {
    localStorage.clear();
    const api = new LoginService();
    api.upsertDemoUser(
      'new@demo.local',
      'New User',
      ['Super User', 'Account Manager'],
      'Email & Password',
    );
    const result = firstValueFrom(api.login({ email: 'new@demo.local', password: 'Demo@123' }));
    await vi.advanceTimersByTimeAsync(650);
    expect((await result).role).toBe('Super User');
    expect(api.changePassword('new@demo.local', 'wrong', 'Changed@123', 'Changed@123')).toContain(
      'incorrect',
    );
    expect(api.changePassword('new@demo.local', 'Demo@123', 'short', 'short')).toContain(
      '8 characters',
    );
    expect(api.changePassword('new@demo.local', 'Demo@123', 'Changed@123', 'different')).toContain(
      'match',
    );
    expect(api.changePassword('new@demo.local', 'Demo@123', 'Changed@123', 'Changed@123')).toBe('');
    const changed = firstValueFrom(api.login({ email: 'new@demo.local', password: 'Changed@123' }));
    await vi.advanceTimersByTimeAsync(650);
    expect((await changed).email).toBe('new@demo.local');
    const restored = firstValueFrom(
      new LoginService().login({ email: 'new@demo.local', password: 'Demo@123' }),
    );
    await vi.advanceTimersByTimeAsync(650);
    expect((await restored).email).toBe('new@demo.local');
    localStorage.clear();
  });
});
