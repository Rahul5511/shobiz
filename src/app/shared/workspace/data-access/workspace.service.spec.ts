import { TestBed } from '@angular/core/testing';
import { WorkspaceService } from './workspace.service';
import { AuthService } from '../../../core/services/login/platform-admin-session';
import { RoleReportsComponent } from '../../../features/reports-and-tracking/reports-and-tracking';

describe('Approved Platform Admin review workflows', () => {
  let s: WorkspaceService;
  const auth = {
    session: { name: 'Platform Admin', email: 'superadmin@demo.local', role: 'Super User' },
    users: [
      { name: 'Account Manager', email: 'accountmanager@demo.local', roles: ['Account Manager'] },
      { name: 'CS Manager', email: 'csmanager@demo.local', roles: ['Client Servicing Manager'] },
    ],
    upsertDemoUser: vi.fn(),
    renameRole: vi.fn(),
    logout: vi.fn(),
  };
  beforeEach(() => {
    localStorage.clear();
    auth.upsertDemoUser.mockReset();
    auth.logout.mockReset();
    TestBed.configureTestingModule({
      providers: [WorkspaceService, { provide: AuthService, useValue: auth }],
    });
    s = TestBed.inject(WorkspaceService);
  });
  afterEach(() => vi.restoreAllMocks());
  function fill() {
    for (const field of s.fields(s.wizard.flow)) {
      if (!field.required || s.wizard.values[field.label]?.length) continue;
      const options = s.options(field);
      const value = options[0] || (field.kind === 'email' ? 'new@example.com' : 'Example');
      s.setField(field, field.multi ? [value] : value);
    }
  }
  function create(email = 'new@example.com', roles = ['DB Head']) {
    s.openTask('Admin');
    s.setField({ label: 'Name' }, 'New User');
    s.setField({ label: 'Email' }, email);
    s.setField({ label: 'Roles' }, roles);
    s.save();
  }
  it('keeps only approved access changes and the seven report catalogues', () => {
    expect(s.can('Events')).toBe(true);
    expect(s.can('Requirements')).toBe(true);
    expect(s.can('RolePermissions')).toBe(false);
    for (const key of ['RegApproval', 'AttendanceCheckin', 'Reports', 'Assignment']) {
      s.openTask(key);
      expect(s.wizard).toBeNull();
      expect(s.error).toContain('cannot perform');
    }
    expect(s.m.masters).toHaveLength(11);
    expect(s.menus.map((group) => group.title)).toEqual([
      'Clients',
      'Events',
      'Reports',
      'Manage Access',
      'Master Data',
    ]);
    const reports = TestBed.runInInjectionContext(() => new RoleReportsComponent());
    expect(reports.catalog).toHaveLength(7);
  });
  it('creates a user and its access atomically and prepares an invitation without sending', () => {
    const count = s.rows.Admin.length;
    create();
    expect(s.error).toBe('');
    expect(s.rows.Admin).toHaveLength(count + 1);
    const row = s.userRow('new@example.com');
    expect(row.values[0]).toBe('New User');
    expect(row.values[4]).toBe('Active');
    expect(row.details.Roles).toEqual(['DB Head']);
    expect(row.addedBy).toBe(auth.session.email);
    expect(s.invitations[0].status).toBe('Prepared locally - not sent');
    expect(auth.upsertDemoUser).toHaveBeenCalledWith(
      'new@example.com',
      'New User',
      ['DB Head'],
      'Email & Password',
      'Active',
    );
  });
  it('adds roles to an existing email without duplicating or renaming that user', () => {
    create();
    const count = s.rows.Admin.length;
    s.openTask('Admin');
    s.setField({ label: 'Email' }, ' NEW@EXAMPLE.COM ');
    s.setField({ label: 'Roles' }, ['Account Manager']);
    s.save();
    expect(s.error).toBe('');
    expect(s.rows.Admin).toHaveLength(count);
    expect(s.userRow('new@example.com').values[0]).toBe('New User');
    expect(s.userRow('new@example.com').details.Roles).toEqual(['DB Head', 'Account Manager']);
  });
  it('keeps a disabled account disabled when roles are added', () => {
    create();
    s.userRow('new@example.com').values[4] = 'Disabled';
    s.openTask('Admin');
    s.setField({ label: 'Email' }, 'new@example.com');
    s.setField({ label: 'Roles' }, ['Account Manager']);
    s.save();
    expect(s.userRow('new@example.com').values[4]).toBe('Disabled');
  });
  it('validates the new identity section and restores legacy drafts without restoring removed fields', () => {
    s.openTask('Admin');
    s.next();
    expect(s.wizard.step).toBe(0);
    expect(s.error).toContain('Name');
    s.wizard.values.Name = 'Draft';
    s.saveDraft();
    s.cancel();
    s.openTask('Admin');
    expect(s.wizard.values.Name).toBe('Draft');
    const labels = s.fields(s.wizard.flow).map((field: { label: string }) => field.label);
    expect(labels).toContain('Roles');
    for (const removed of [
      'Middle name',
      'Display name',
      'Profile picture',
      'Department',
      'Employee code',
    ])
      expect(labels).not.toContain(removed);
  });
  it('keeps removed client fields in stored records while omitting them from forms and review', () => {
    const row = s.rows.Clients[0],
      website = row.details.Website;
    s.openTask('Clients', row);
    expect(s.fields(s.wizard.flow).map((field: { label: string }) => field.label)).not.toContain(
      'Website',
    );
    fill();
    s.save();
    expect(s.error).toBe('');
    expect(s.rows.Clients.find((r: { id: string }) => r.id === row.id).details.Website).toBe(
      website,
    );
  });
  it('supports Multi City event creation and updates the list projection', () => {
    s.openTask('Events');
    s.setField({ label: 'Event Name' }, 'Review event');
    s.setField({ label: 'Event Type' }, 'Multi City');
    fill();
    s.wizard.values['Public registration path'] = '/review/event/registration';
    s.save();
    expect(s.error).toBe('');
    s.nav('Events');
    const event = s.rows.Events.find((r: { values: string[] }) => r.values[0] === 'Review event');
    expect(event).toBeTruthy();
    expect(Array.isArray(event.details.City)).toBe(true);
    expect(s.fields(s.m.flows.Events).map((field: { label: string }) => field.label)).not.toContain(
      'Capacity',
    );
  });
  it('locks the system role and edits custom grants from the role itself', () => {
    const system = s.rows.RoleBuilder.find((r: { locked?: boolean }) => r.locked);
    s.editRecord(system);
    expect(s.wizard).toBeNull();
    s.openTask('RoleBuilder');
    s.setField({ label: 'Role Name' }, 'Review role');
    s.grant(s.m.permissions[0].code, true);
    s.save();
    expect(s.error).toBe('');
    const row = s.rows.RoleBuilder.find((r: { values: string[] }) => r.values[0] === 'Review role');
    s.nav('RoleBuilder');
    s.editRecord(row);
    s.grant(s.m.permissions[0].code, false);
    s.save();
    expect(s.rows.RoleBuilder.find((r: { id: string }) => r.id === row.id).grants).toEqual([]);
    s.openTask('RoleBuilder');
    s.setField({ label: 'Role Name' }, ' review ROLE ');
    s.save();
    expect(s.error).toContain('already exists');
  });
  it('protects the last active Platform Admin from disabling or losing its role', () => {
    const admin = s.userRow(auth.session.email);
    s.beginDisable(admin);
    expect(s.disableTarget).toBeNull();
    expect(s.error).toContain('last active');
    s.openTask('Admin', admin);
    s.setField({ label: 'Roles' }, ['Account Manager']);
    s.save();
    expect(s.error).toContain('must remain active');
  });
  it('preserves assigned users when renaming a custom role and rejects built-in role names', () => {
    s.openTask('RoleBuilder');
    s.setField({ label: 'Role Name' }, 'Review role');
    s.save();
    create('custom@example.com', ['Review role']);
    const user = s.userRow('custom@example.com');
    user.values[4] = 'Disabled';
    const role = s.rows.RoleBuilder.find((row: any) => row.values[0] === 'Review role');
    s.openTask('RoleBuilder', role);
    s.setField({ label: 'Role Name' }, 'Updated review role');
    s.save();
    expect(s.error).toBe('');
    expect(s.userRow('custom@example.com').details.Roles).toEqual(['Updated review role']);
    expect(s.userRow('custom@example.com').values[4]).toBe('Disabled');
    expect(auth.renameRole).toHaveBeenCalledWith('Review role', 'Updated review role');
    s.openTask('RoleBuilder');
    s.setField({ label: 'Role Name' }, 'Account Manager');
    s.save();
    expect(s.error).toContain('already exists');
  });
  it('disables and transfers calling and client work to an active successor', () => {
    create();
    const user = s.userRow('new@example.com');
    const successor = s.rows.Admin.find(
      (r: { values: string[] }) => r.values[1] === auth.session.email,
    );
    s.rows.Clients[0].details['Account Manager'] = 'New User';
    s.regs[0].telecaller = 'New User';
    s.beginDisable(user);
    expect(s.disableAssignments.length).toBeGreaterThan(0);
    s.disableSuccessor = successor.id;
    s.confirmDisable();
    expect(s.userRow('new@example.com').values[4]).toBe('Disabled');
    expect(s.rows.Clients[0].details['Account Manager']).toBe(successor.values[0]);
    expect(s.regs[0].telecaller).toBe(successor.values[0]);
  });
  it('flags unassigned work and allows it to be assigned later', () => {
    create();
    s.regs[0].telecaller = 'New User';
    s.beginDisable(s.userRow('new@example.com'));
    s.confirmDisable();
    expect(s.pendingAssignments.length).toBeGreaterThan(0);
    expect(s.regs[0].telecaller).toBe('');
    const pending = s.pendingAssignments.find((row) => row.kind === 'Calling')!;
    const successor = s.userRow(auth.session.email);
    s.assignPending(pending, successor.id);
    expect(s.regs[0].telecaller).toBe(successor.values[0]);
    expect(s.pendingAssignments.some((row) => row.id === pending.id)).toBe(false);
  });
  it('does not commit user creation or invitation if browser persistence fails', () => {
    const count = s.rows.Admin.length;
    s.openTask('Admin');
    s.wizard.values.Name = 'Failed user';
    s.wizard.values.Email = 'failure@example.com';
    s.wizard.values.Roles = ['DB Head'];
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    s.save();
    expect(s.rows.Admin).toHaveLength(count);
    expect(s.invitations).toHaveLength(0);
    expect(auth.upsertDemoUser).not.toHaveBeenCalled();
    expect(s.wizard).not.toBeNull();
    expect(s.error).toContain('storage');
  });
  it('rolls back workspace changes if the account adapter cannot save', () => {
    const count = s.rows.Admin.length;
    auth.upsertDemoUser.mockImplementation(() => {
      throw new Error('quota');
    });
    create();
    expect(s.rows.Admin).toHaveLength(count);
    expect(s.invitations).toHaveLength(0);
    expect(s.wizard).not.toBeNull();
    expect(s.error).toContain('not applied');
  });
  it('uses active locations and shows attendee names while keeping user-list emails masked', () => {
    const country = s.rows.Countries.find(
      (row: { values: string[] }) => row.values[4] === 'Active',
    );
    const name = country.details['Country name'];
    expect(s.locationOptions('Country', {})).toContain(name);
    s.nav('Countries');
    s.toggle(country);
    expect(s.locationOptions('Country', {})).not.toContain(name);
    s.nav('Reports');
    expect(s.reportRows.some((row) => row[1] === 'Restricted')).toBe(false);
    s.nav('Admin');
    expect(s.listRows[0].values[1]).toContain('***@');
    expect(s.rows.Admin[0].values[1]).not.toContain('***');
  });
  it('preserves invalid-date/no-results report states and logs prepared sharing only', () => {
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
    expect(report.groups()).toEqual([]);
    expect(s.prepareShare('Report', 'bad-email', 'scope', {}, [])).toBe(false);
    expect(s.prepareShare('Report', 'contact@example.com', 'one client', {}, ['Name'])).toBe(true);
    expect(s.shares[0].status).toBe('Prepared locally - not sent');
  });
  it('migrates a legacy access-assignment draft to the combined user edit flow', () => {
    const user = s.rows.Admin[0];
    s.drafts['Super User|UserRoleGrant|new'] = {
      key: 'UserRoleGrant',
      values: {
        User: user.values[1],
        Email: user.values[1],
        Roles: ['Account Manager'],
        Event: 'Northstar Roadshow',
        City: ['Mumbai'],
        Country: 'India',
        State: 'Maharashtra',
      },
      step: 3,
      visited: 3,
    };
    s.persist();
    const restored = TestBed.runInInjectionContext(() => new WorkspaceService());
    restored.openTask('Admin', restored.userRow(user.values[1]));
    expect(restored.wizard.values.Name).toBe(user.values[0]);
    expect(restored.wizard.values.Event).toEqual(['Northstar Roadshow']);
    expect(restored.wizard.flow.steps.map((step: { label: string }) => step.label)).toEqual([
      'Identity',
      'Roles & Assignment',
      'Review',
    ]);
    expect(restored.can('UserRoleGrant')).toBe(false);
  });
  it('restores an existing client and its omitted data after a failed edit save', () => {
    const before = JSON.stringify(s.rows.Clients[0]);
    s.openTask('Clients', s.rows.Clients[0]);
    s.wizard.values['Company Name'] = 'Changed name';
    fill();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    s.save();
    expect(JSON.stringify(s.rows.Clients[0])).toBe(before);
    expect(s.wizard).not.toBeNull();
    expect(s.error).toContain('storage');
  });
  it('validates added client contacts and keeps prepared manager notifications local', () => {
    s.openTask('Clients', s.rows.Clients[0]);
    s.wizard.values['Secondary contacts'] = [{ Name: 'Contact', Email: 'bad' }];
    s.wizard.step = s.wizard.flow.steps.findIndex(
      (step: { label: string }) => step.label === 'Client Representatives',
    );
    expect(s.valid()).toBe(false);
    s.wizard.values['Secondary contacts'][0].Email = 'contact@example.com';
    s.wizard.values['Additional CS Managers'] = [
      { Name: 'New manager', Email: 'manager@example.com' },
    ];
    fill();
    s.save();
    expect(s.error).toBe('');
    expect(s.preparedNotifications[0]).toMatchObject({
      email: 'manager@example.com',
      status: 'Prepared locally - not sent',
    });
    expect(auth.upsertDemoUser).not.toHaveBeenCalled();
  });
  it('does not retain a sharing preview when persistence fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(s.prepareShare('Report', 'contact@example.com', 'One client', {}, ['Name'])).toBe(false);
    expect(s.shares).toEqual([]);
  });
});
