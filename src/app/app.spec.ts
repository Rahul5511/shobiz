import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { routes } from './app.routes';
import { LoginService, DEMO_CREDENTIALS } from './core/services/login/login.service';
import { AuthSession } from './core/services/login/auth-session.service';
import { AuthApiError, AuthUser } from './core/models/login/login.models';
import { By } from '@angular/platform-browser';
import { WorkspaceComponent } from './layouts/platform-admin/platform-admin';
import { WorkspaceService } from './shared/workspace/data-access/workspace.service';

describe('App', () => {
  let response: Subject<AuthUser>;
  let api: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    response = new Subject<AuthUser>();
    api = { login: vi.fn(() => response.asObservable()) };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), { provide: LoginService, useValue: api }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('opens the Platform Admin dashboard, preserves the event restrictions, and logs out', async () => {
    localStorage.clear();
    const harness = await RouterTestingHarness.create('/login');
    element<HTMLButtonElement>(harness, '.demo-button').click();
    submit(harness);
    response.next({
      id: 'platform-admin',
      name: 'Platform Admin',
      email: DEMO_CREDENTIALS.email,
      role: 'Super User',
      roles: ['Super User'],
    });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/app');
    expect(harness.routeNativeElement?.textContent).toContain('Platform Admin Dashboard');
    const button = (text: string) => {
      const found = Array.from(harness.routeNativeElement!.querySelectorAll('button')).find(
        (item) => item.textContent?.trim() === text,
      );
      if (!found) throw new Error('Missing button: ' + text);
      return found;
    };
    button('Go to workspace').click();
    harness.detectChanges();
    element<HTMLButtonElement>(harness, '[aria-label="Events"]').click();
    harness.detectChanges();
    element<HTMLButtonElement>(harness, '.nav-children .navitem').click();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('app-record-card')).toBeTruthy();
    expect(harness.routeNativeElement?.textContent).not.toContain('Create New Event');
    expect(harness.routeNativeElement?.querySelector('[aria-label="Edit record"]')).toBeNull();
    expect(
      harness.routeNativeElement?.querySelector('[aria-label="Public registration link and QR"]'),
    ).toBeTruthy();
    element<HTMLButtonElement>(harness, '.profile-trigger').click();
    harness.detectChanges();
    button('Logout').click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });

  function element<T extends Element>(harness: RouterTestingHarness, selector: string): T {
    const found = harness.routeNativeElement?.querySelector<T>(selector);
    if (!found) throw new Error(`Missing test element: ${selector}`);
    return found;
  }

  it('keeps separated screens on the same state, forms, reports and profile context', async () => {
    localStorage.clear();
    TestBed.inject(AuthSession).login(DEMO_CREDENTIALS).subscribe();
    response.next({
      id: 'platform-admin',
      name: 'Platform Admin',
      email: DEMO_CREDENTIALS.email,
      role: 'Super User',
      roles: ['Super User'],
    });
    const harness = await RouterTestingHarness.create('/app');
    const shell = harness.routeDebugElement!.componentInstance as WorkspaceComponent;
    shell.closeGuide();
    const state = shell.s;
    const detect = () => {
      shell.cdr.markForCheck();
      harness.detectChanges();
    };
    const expectScreen = (selector: string) => {
      detect();
      const page = harness.routeDebugElement!.query(By.css(selector));
      expect(page).toBeTruthy();
      expect(page.injector.get(WorkspaceService)).toBe(state);
      expect(TestBed.inject(Router).url).toBe('/app');
    };

    state.nav('Clients');
    expectScreen('app-clients-page');
    element<HTMLButtonElement>(harness, 'app-record-card .primary').click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(element(harness, '.form-card').textContent).toContain('Client Profile');
    state.wizard.values['Company Name'] = 'Draft to preserve';
    state.saveDraft();
    state.cancel();
    state.nav('Admin');
    expectScreen('app-users-page');
    state.nav('Clients');
    state.openTask('Clients');
    expect(state.wizard.values['Company Name']).toBe('Draft to preserve');
    state.cancel();

    const masters = [
      ['Countries', 'countries'],
      ['States', 'states'],
      ['Districts', 'districts'],
      ['Cities', 'cities'],
      ['Industries', 'industries'],
      ['SubIndustries', 'sub-industries'],
      ['Segments', 'segments'],
      ['Departments', 'departments'],
      ['Designations', 'designations'],
      ['ProfileLevels', 'profile-levels'],
      ['CallStatuses', 'call-statuses'],
    ];
    for (const [key, selector] of masters) {
      state.nav(key);
      expectScreen(`app-${selector}-page`);
      expect(element(harness, 'app-record-card').textContent).toContain(
        state.m.entities[key].label,
      );
    }
    state.openTask('RolePermissions');
    expectScreen('app-role-permissions-page');
    expect(element(harness, '.form-card').textContent).toContain('Selected role');
    state.cancel();
    state.nav('Reports');
    expectScreen('app-reports-page');
    expect(harness.routeNativeElement?.textContent).toContain('Restricted');
    state.nav('AttendanceReport');
    expectScreen('app-registration-vs-attendance-page');
    state.openRoleReports();
    expectScreen('app-role-reports');

    shell.account('account');
    expectScreen('app-profile-page');
    shell.profileDraft = { ...shell.profile, name: 'Updated Admin' };
    shell.saveProfile();
    detect();
    expect(element(harness, '.profile-trigger').textContent).toContain('Updated Admin');
    expect(element(harness, 'app-profile-page').textContent).toContain('Updated Admin');
    shell.account('password');
    expectScreen('app-change-password-page');
    expect(element(harness, '[name="currentPassword"]')).toBeTruthy();
    expect(element(harness, '[name="newPassword"]')).toBeTruthy();
    expect(element(harness, '[name="confirmPassword"]')).toBeTruthy();
    localStorage.clear();
  });

  function input(harness: RouterTestingHarness, selector: string, value: string): void {
    const field = element<HTMLInputElement>(harness, selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function submit(harness: RouterTestingHarness): void {
    element<HTMLFormElement>(harness, 'form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    harness.detectChanges();
  }

  it('redirects the root and a protected deep link to login', async () => {
    const harness = await RouterTestingHarness.create('/');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login');
    await harness.navigateByUrl('/events?view=upcoming');
    expect(router.url).toBe('/login?returnUrl=%2Fevents%3Fview%3Dupcoming');
    expect(harness.routeNativeElement?.querySelector('#email')).toBeTruthy();
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });

  it('validates required fields and focuses the first invalid field without calling the API', async () => {
    const harness = await RouterTestingHarness.create('/login');
    submit(harness);
    expect(element(harness, '#email-error').textContent).toContain('Enter your email address');
    expect(element(harness, '#password-error').textContent).toContain('Enter your password');
    expect(document.activeElement).toBe(element(harness, '#email'));
    expect(api.login).not.toHaveBeenCalled();
  });

  it('rejects malformed email addresses', async () => {
    const harness = await RouterTestingHarness.create('/login');
    input(harness, '#email', 'not-an-email');
    input(harness, '#password', 'some-password');
    submit(harness);
    expect(element(harness, '#email-error').textContent).toContain('Enter a valid email address');
    expect(api.login).not.toHaveBeenCalled();
  });

  it('fills the demo account and toggles password visibility', async () => {
    const harness = await RouterTestingHarness.create('/login');
    element<HTMLButtonElement>(harness, '.demo-button').click();
    harness.detectChanges();
    expect(element<HTMLInputElement>(harness, '#email').value).toBe(DEMO_CREDENTIALS.email);
    expect(element<HTMLInputElement>(harness, '#password').value).toBe(DEMO_CREDENTIALS.password);
    expect(element<HTMLInputElement>(harness, '#password').type).toBe('password');
    element<HTMLButtonElement>(harness, '.password-toggle').click();
    harness.detectChanges();
    expect(element<HTMLInputElement>(harness, '#password').type).toBe('text');
    expect(element(harness, '.password-toggle').getAttribute('aria-pressed')).toBe('true');
  });

  it('prevents duplicate submissions, opens the workspace, redirects signed-in guests, and signs out', async () => {
    const harness = await RouterTestingHarness.create(
      '/login?returnUrl=%2Fevents%3Fview%3Dupcoming',
    );
    element<HTMLButtonElement>(harness, '.demo-button').click();
    submit(harness);
    submit(harness);
    expect(api.login).toHaveBeenCalledTimes(1);
    expect(element<HTMLButtonElement>(harness, '[type="submit"]').disabled).toBe(true);
    expect(element<HTMLInputElement>(harness, '#email').readOnly).toBe(true);
    response.next({ id: '1', name: 'Test Organiser', email: DEMO_CREDENTIALS.email });
    await harness.fixture.whenStable();
    harness.detectChanges();
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/events?view=upcoming');
    expect(harness.routeNativeElement?.textContent).toContain('Test Organiser');
    await harness.navigateByUrl('/login');
    expect(router.url).toBe('/events');
    element<HTMLButtonElement>(harness, '.secondary-button').click();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/login');
    expect(TestBed.inject(AuthSession).user()).toBeNull();
    await harness.navigateByUrl('/events');
    expect(router.url.startsWith('/login?returnUrl=')).toBe(true);
  });

  it('preserves input after an authentication error and allows retry', async () => {
    const harness = await RouterTestingHarness.create('/login');
    input(harness, '#email', DEMO_CREDENTIALS.email);
    input(harness, '#password', 'wrong-password');
    submit(harness);
    response.error(new AuthApiError('invalid-credentials'));
    harness.detectChanges();
    expect(element(harness, '[role="alert"]').textContent).toContain(
      'email or password is incorrect',
    );
    expect(element<HTMLInputElement>(harness, '#password').value).toBe('wrong-password');
    expect(element<HTMLButtonElement>(harness, '[type="submit"]').disabled).toBe(false);
    response = new Subject<AuthUser>();
    input(harness, '#password', DEMO_CREDENTIALS.password);
    submit(harness);
    expect(api.login).toHaveBeenCalledTimes(2);
    response.next({ id: '1', name: 'Test Organiser', email: DEMO_CREDENTIALS.email });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/events');
  });

  it('shows a safe retryable message for an unexpected API failure', async () => {
    const harness = await RouterTestingHarness.create('/login');
    element<HTMLButtonElement>(harness, '.demo-button').click();
    submit(harness);
    response.error(new Error('Private server diagnostics'));
    harness.detectChanges();
    expect(element(harness, '[role="alert"]').textContent).toContain('Please try again');
    expect(harness.routeNativeElement?.textContent).not.toContain('Private server diagnostics');
    expect(element<HTMLButtonElement>(harness, '[type="submit"]').disabled).toBe(false);
  });

  it('cancels a pending sign-in when the page is destroyed', async () => {
    const harness = await RouterTestingHarness.create('/login');
    element<HTMLButtonElement>(harness, '.demo-button').click();
    submit(harness);
    await harness.navigateByUrl('/missing');
    expect(response.observed).toBe(false);
    expect(TestBed.inject(AuthSession).status()).toBe('anonymous');
    expect(harness.routeNativeElement?.textContent).toContain('404');
  });
});
