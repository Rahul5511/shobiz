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
  it('restores branding and the legacy postal value as PIN Code without losing either on save', () => {
    const row = s.rows.Clients[0];
    s.openTask('Clients', row);
    expect(s.wizard.flow.steps.map((step: any) => step.label)).toContain('Branding');
    expect(s.wizard.values['PIN Code']).toBe(row.details['Postal code']);
    s.wizard.values['PIN Code'] = '400001';
    s.wizard.values['Client logo preview'] = 'data:image/png;base64,example';
    fill();
    s.save();
    expect(s.error).toBe('');
    const saved = s.rows.Clients.find((record: any) => record.id === row.id);
    expect(saved.details['PIN Code']).toBe('400001');
    expect(saved.details['Postal code']).toBe('400001');
    s.openTask('Clients', saved);
    expect(s.wizard.values['Client logo preview']).toBe('data:image/png;base64,example');
  });
  it('preserves legacy organisation values while omitting removed fields from onboarding', () => {
    s.openTask('Admin');
    expect(s.wizard.flow.steps.map((step: any) => step.label)).toEqual([
      'Identity',
      'Roles & Assignment',
      'Review',
    ]);
    s.wizard.values.Name = 'Organisation user';
    s.wizard.values.Email = 'organisation@example.com';
    s.wizard.values.Roles = ['DB Head'];
    expect(s.fields(s.wizard.flow).map((field: any) => field.label)).not.toContain('Department');
    s.wizard.values.Department = 'Database';
    s.wizard.values['Employee code'] = 'EMP-NEW';
    s.wizard.values['Reporting manager'] = 'Manager';
    s.save();
    expect(s.error).toBe('');
    s.openTask('Admin', s.userRow('organisation@example.com'));
    expect(s.wizard.values.Department).toBe('Database');
    expect(s.wizard.values['Employee code']).toBe('EMP-NEW');
    expect(s.wizard.values['Reporting manager']).toBe('Manager');
    expect(s.fields(s.wizard.flow).filter((field: any) => field.label === 'Client')).toHaveLength(
      1,
    );
  });
  it('creates events while keeping standalone Role Reports paused', () => {
    const count = s.rows.Events.length;
    s.openTask('Events');
    s.wizard.values['Event Name'] = 'Created follow-up event';
    fill();
    s.wizard.values['Public registration path'] = '/created-follow-up';
    s.save();
    expect(s.error).toBe('');
    expect(s.rows.Events).toHaveLength(count + 1);
    s.openRoleReports();
    expect(s.key).toBe('Reports');
    expect(s.view).toBe('reports');
    expect(s.m.entities.RoleBuilder.label).toBe('Role & Permission');
  });
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
    expect(s.canCreate('Events')).toBe(true);
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
      'Permission Settings',
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
    for (const removed of ['Middle name', 'Display name', 'Profile picture'])
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
  it('supports Multi City creation and editing with the list projection', () => {
    const count = s.rows.Events.length;
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
    expect(s.rows.Events.length).toBe(count + 1);
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
  it('disables and transfers mixed work only to qualified successors', () => {
    create();
    const user = s.userRow('new@example.com');
    const manager = s.rows.Admin.find(
      (row: any) => row.values[4] === 'Active' && row.details.Roles.includes('Account Manager'),
    );
    create('caller@example.com', ['Telecaller']);
    const caller = s.userRow('caller@example.com');
    caller.values[0] = 'Caller successor';
    s.rows.Clients[0].details['Account Manager'] = 'New User';
    s.regs[0].telecaller = 'New User';
    s.beginDisable(user);
    const client = s.disableAssignments.find((item) => item.kind === 'Client')!;
    const calling = s.disableAssignments.find((item) => item.kind === 'Calling')!;
    expect(s.successorsFor(calling).some((row) => row.id === manager.id)).toBe(false);
    s.disableSuccessors[client.id] = manager.id;
    s.disableSuccessors[calling.id] = caller.id;
    s.confirmDisable();
    expect(s.error).toBe('');
    expect(s.userRow('new@example.com').values[4]).toBe('Disabled');
    expect(s.rows.Clients[0].details['Account Manager']).toBe(manager.values[0]);
    expect(s.regs[0].telecaller).toBe(caller.values[0]);
  });
  it('flags unassigned work and allows it to be assigned later', () => {
    create();
    s.regs[0].telecaller = 'New User';
    s.beginDisable(s.userRow('new@example.com'));
    s.confirmDisable();
    expect(s.pendingAssignments.length).toBeGreaterThan(0);
    expect(s.regs[0].telecaller).toBe('');
    const pending = s.pendingAssignments.find((row) => row.kind === 'Calling')!;
    create('pending-caller@example.com', ['Telecaller']);
    const successor = s.userRow('pending-caller@example.com');
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
  it('shows assignment fields only for Assigned scope and offers events without requiring Client', () => {
    s.openTask('Admin');
    s.wizard.values.Roles = ['Super User'];
    expect(s.fieldVisible({ label: 'Client' })).toBe(false);
    expect(s.fieldVisible({ label: 'City' })).toBe(false);
    s.wizard.values.Roles = ['DB Head'];
    expect(s.fieldVisible({ label: 'Client' })).toBe(true);
    const field = s.fields(s.wizard.flow).find((field: any) => field.label === 'Event');
    expect(s.options(field).length).toBeGreaterThan(0);
    const event = s.rows.Events.find((row: any) => s.recordCities(row).length > 1);
    s.setField({ label: 'Event' }, [event.values[0]]);
    expect(s.options({ label: 'City' })).toEqual(s.recordCities(event));
    s.wizard.values.Roles = ['Super User'];
    s.wizard.values.Name = 'All scope';
    s.wizard.values.Email = 'all@example.com';
    s.wizard.values.City = ['Mumbai'];
    s.save();
    expect(s.error).toBe('');
    expect(s.userRow('all@example.com').details['Access assignment'].Event).toEqual([]);
    expect(s.userRow('all@example.com').details['Access assignment'].City).toEqual([]);
  });
  it('saves distinct city details and filters city DRF links', () => {
    s.openTask('Events');
    s.setField({ label: 'Event Name' }, 'City test');
    fill();
    s.setField({ label: 'Event Type' }, 'Multi City');
    s.setField({ label: 'City' }, ['Mumbai', 'Pune']);
    s.wizard.values['City details'][0] = {
      city: 'Mumbai',
      stage: 'Confirmed',
      status: 'Upcoming',
      start: '2026-12-01',
      end: '2026-12-02',
      pax: 40,
      venue: 'Mumbai Hall',
    };
    s.wizard.values['City details'][1] = {
      city: 'Pune',
      stage: 'Planning',
      status: 'Upcoming',
      start: '2026-12-04',
      end: '2026-12-05',
      pax: 70,
      venue: 'Pune Hall',
    };
    s.wizard.values['Public registration path'] = '/city-test';
    s.save();
    expect(s.error).toBe('');
    const row = s.rows.Events.find((row: any) => row.values[0] === 'City test');
    expect(s.eventCityDetails(row).map((city: any) => city.pax)).toEqual([40, 70]);
    s.rows.DRF = [
      {
        id: 'm',
        values: ['Mumbai DRF', '', '', '', 'Active'],
        details: { Event: 'City test', City: 'Mumbai' },
      },
      {
        id: 'p',
        values: ['Pune DRF', '', '', '', 'Active'],
        details: { Event: 'City test', City: 'Pune' },
      },
    ];
    s.recordLink(row, 'DRF', 'Pune');
    expect(s.relatedPanel!.rows).toEqual([['Pune DRF', 'Active']]);
    s.openTask('Events', row);
    s.wizard.values['City details'][0].end = '2026-11-01';
    s.save();
    expect(s.error).toContain('Mumbai');
  });
  it('keeps logo optional, removes client banner from the form and changes postal label by country', () => {
    s.openTask('Clients', s.rows.Clients[0]);
    const fields = s.fields(s.wizard.flow);
    expect(fields.some((field: any) => field.label === 'Client banner')).toBe(false);
    expect(fields.find((field: any) => field.label === 'Client logo').required).toBe(false);
    s.wizard.values.Country = 'India';
    expect(s.fieldLabel({ label: 'PIN Code' })).toBe('PIN Code');
    s.wizard.values.Country = 'United Arab Emirates';
    expect(s.fieldLabel({ label: 'PIN Code' })).toBe('Postal code');
  });
  it('rejects invalid event websites and unsupported or oversized images', async () => {
    s.openTask('Events');
    fill();
    s.wizard.values['Event Name'] = 'Website test';
    s.wizard.values['Event website'] = 'javascript:alert(1)';
    s.save();
    expect(s.error).toContain('http or https');
    const before = s.wizard.values['Event logo'];
    await s.file(
      { label: 'Event logo', kind: 'image' },
      { target: { files: [new File(['svg'], 'test.svg', { type: 'image/svg+xml' })] } },
    );
    expect(s.error).toContain('PNG');
    expect(s.wizard.values['Event logo']).toBe(before);
    await s.file(
      { label: 'Event logo', kind: 'image' },
      { target: { files: [{ name: 'large.png', type: 'image/png', size: 3 * 1024 * 1024 }] } },
    );
    expect(s.error).toContain('2 MB');
  });
  it('refuses an unrelated successor before changing held work or account status', () => {
    create();
    s.regs[0].telecaller = 'New User';
    s.beginDisable(s.userRow('new@example.com'));
    const assignment = s.disableAssignments.find((item) => item.kind === 'Calling')!;
    s.disableSuccessors[assignment.id] = s.userRow(auth.session.email).id;
    s.confirmDisable();
    expect(s.error).toContain('qualified');
    expect(s.userRow('new@example.com').values[4]).toBe('Active');
    expect(s.regs[0].telecaller).toBe('New User');
  });
  it('uses event branding with the client logo fallback but never the retired client banner', () => {
    const client = s.rows.Clients.find((row: any) => row.values[0] === s.publicClient);
    client.details['Client logo preview'] = 'client-logo';
    client.details['Client banner preview'] = 'retired-banner';
    const event = s.rows.Events.find((row: any) => row.values[0] === s.publicEvent);
    event.details['Event logo preview'] = 'event-logo';
    event.details['Event banner preview'] = 'event-banner';
    expect(s.publicLogo).toBe('event-logo');
    expect(s.publicBanner).toBe('event-banner');
    delete event.details['Event logo preview'];
    delete event.details['Event banner preview'];
    expect(s.publicLogo).toBe('client-logo');
    expect(s.publicBanner).not.toBe('retired-banner');
  });
});
