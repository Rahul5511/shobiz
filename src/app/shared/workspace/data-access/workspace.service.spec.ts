import { TestBed } from '@angular/core/testing';
import { WorkspaceService } from './workspace.service';
import { AuthService } from '../../../core/services/login/platform-admin-session';
import { RoleReportsComponent } from '../../../features/reports-and-tracking/reports-and-tracking';

describe('Platform Admin workflows', () => {
  let workspace: WorkspaceService;
  const auth = {
    session: { name: 'Platform Admin', email: 'superadmin@demo.local', role: 'Super User' },
    users: [
      { name: 'Account Manager', email: 'accountmanager@demo.local', roles: ['Account Manager'] },
      { name: 'CS Manager', email: 'csmanager@demo.local', roles: ['Client Servicing Manager'] },
    ],
    upsertDemoUser: vi.fn(),
  };
  beforeEach(() => {
    localStorage.clear();
    auth.upsertDemoUser.mockClear();
    TestBed.configureTestingModule({
      providers: [WorkspaceService, { provide: AuthService, useValue: auth }],
    });
    workspace = TestBed.inject(WorkspaceService);
  });

  function fillRequired(): void {
    for (const field of workspace.fields(workspace.wizard.flow)) {
      if (!field.required || workspace.wizard.values[field.label]?.length) continue;
      const options = workspace.options(field);
      const value = options.length
        ? options[0]
        : field.kind === 'email'
          ? 'new@example.com'
          : 'Example';
      workspace.setField(field, field.multi ? [value] : value);
    }
  }

  it('exposes only the documented entities, workflows and seven reports', () => {
    expect(workspace.entities).toHaveLength(18);
    expect(workspace.flowKeys).toHaveLength(16);
    expect(workspace.m.masters).toHaveLength(11);
    for (const action of [
      'Events',
      'Requirements',
      'RegApproval',
      'AttendanceCheckin',
      'Reports',
      'Assignment',
    ]) {
      workspace.openTask(action);
      expect(workspace.wizard).toBeNull();
      expect(workspace.error).toContain('cannot perform');
    }
    expect(workspace.menus.map((group: { title: string }) => group.title)).not.toContain(
      'Notifications',
    );
    const report = TestBed.runInInjectionContext(() => new RoleReportsComponent());
    expect(report.catalog.map((item) => item.title).sort()).toEqual(
      [
        'Registered vs. attended',
        'Check-in activity',
        'Client onboarding',
        'User accounts by status',
        'Role configuration',
        'Event schedule and status',
        'Notifications by status',
      ].sort(),
    );
  });

  it('creates a pending profile and activates that same user through separate access assignment', () => {
    workspace.nav('Admin');
    const count = workspace.rows.Admin.length;
    workspace.openTask('Admin');
    expect(workspace.wizard.values['First name']).toBe('');
    expect(
      workspace
        .fields(workspace.wizard.flow)
        .some((field: { label: string }) => field.label === 'Roles'),
    ).toBe(false);
    workspace.setField({ label: 'First name' }, 'New');
    workspace.setField({ label: 'Last name' }, 'User');
    workspace.setField({ label: 'Email' }, 'new@example.com');
    fillRequired();
    workspace.save();
    expect(workspace.error).toBe('');
    expect(workspace.rows.Admin).toHaveLength(count + 1);
    const user = workspace.userRow('new@example.com');
    expect(user.values[0]).toBe('New User');
    expect(user.values[4]).toBe('Pending');
    workspace.openTask('UserRoleGrant');
    workspace.setField({ label: 'User' }, user.values[1]);
    expect(workspace.wizard.values.Email).toBe(user.values[1]);
    workspace.setField({ label: 'Roles' }, ['Super User']);
    fillRequired();
    workspace.save();
    expect(workspace.error).toBe('');
    expect(workspace.rows.Admin).toHaveLength(count + 1);
    expect(user.values[4]).toBe('Active');
    expect(user.values[2]).toBe('Platform Admin');
    expect(auth.upsertDemoUser).toHaveBeenCalledWith(
      'new@example.com',
      'New User',
      ['Super User'],
      expect.any(String),
    );
  });

  it('validates wizard sections, preserves drafts and rejects duplicate email ignoring case', () => {
    workspace.openTask('Admin');
    workspace.next();
    expect(workspace.wizard.step).toBe(0);
    expect(workspace.error).toContain('First name');
    workspace.wizard.values['First name'] = 'Draft';
    workspace.saveDraft();
    workspace.cancel();
    workspace.openTask('Admin');
    expect(workspace.wizard.values['First name']).toBe('Draft');
    workspace.wizard.values.Email = String(workspace.rows.Admin[0].values[1]).toUpperCase();
    fillRequired();
    workspace.save();
    expect(workspace.error).toContain('email already exists');
  });

  it('keeps role creation separate from permission editing and preserves navigation policy', () => {
    workspace.openTask('RoleBuilder');
    workspace.setField({ label: 'Role Name' }, 'Review role');
    workspace.setField({ label: 'Description' }, 'Review only');
    workspace.grant(workspace.m.permissions[0].code, true);
    workspace.save();
    expect(workspace.error).toBe('');
    const before = [...workspace.entities];
    workspace.openTask('RolePermissions');
    workspace.setField({ label: 'Selected role' }, 'Review role');
    expect(workspace.wizard.grants).toHaveLength(1);
    workspace.grant(workspace.m.permissions[0].code, false);
    workspace.save();
    expect(workspace.grants['Review role']).toEqual([]);
    expect(workspace.entities).toEqual(before);
  });

  it('uses active parent locations and masks attendee names in operational reports', () => {
    const country = workspace.rows.Countries.find(
      (row: { values: string[]; details: Record<string, string> }) => row.values[4] === 'Active',
    );
    const name = country.details['Country name'];
    expect(workspace.locationOptions('Country', {})).toContain(name);
    workspace.nav('Countries');
    workspace.toggle(country);
    expect(workspace.locationOptions('Country', {})).not.toContain(name);
    workspace.nav('Reports');
    expect(workspace.reportRows.length).toBeGreaterThan(0);
    expect(workspace.reportRows.every((row) => row[1] === 'Restricted')).toBe(true);
  });

  it('preserves invalid-date and no-results states for role reports', () => {
    const report = TestBed.runInInjectionContext(() => new RoleReportsComponent());
    report.filters.update((value) => ({ ...value, from: '2026-11-30', to: '2026-11-01' }));
    expect(report.invalidRange()).toBe(true);
    expect(report.filtered()).toEqual([]);
    report.filters.update((value) => ({
      ...value,
      from: '',
      to: '',
      search: 'no-matching-record-123',
    }));
    expect(report.invalidRange()).toBe(false);
    expect(report.groups()).toEqual([]);
  });
});
