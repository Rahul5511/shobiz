import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/services/login/platform-admin-session';
import model from '../data/model';
import QRCode from 'qrcode';
import {
  isPlatformAdmin,
  PLATFORM_ADMIN_ENTITIES,
  PLATFORM_ADMIN_WORKFLOWS,
} from '../../../core/permissions/platform-admin-policy';
export const copy = (x: any) => JSON.parse(JSON.stringify(x));
@Injectable()
export class WorkspaceService {
  auth = inject(AuthService);
  m: any = model;
  rows: any = {};
  regs: any[] = [];
  drafts: any = {};
  grants: any = {};
  configs: any = {};
  view = 'dashboard';
  key = '';
  wizard: any = null;
  selected: any = null;
  notice = '';
  error = '';
  event = 'Northstar Roadshow';
  reportType = 'attendance';
  search = '';
  search2 = '';
  agent = 'All';
  date = '2026-11-07';
  limit = 5;
  reportPage = 1;
  qrImage = '';
  publicEvent = 'Northstar Roadshow';
  publicClient = 'Northstar Technologies';
  receipt: any = null;
  mobileMenu = false;
  permissionQuery = '';
  openSection: string | null = null;
  constructor() {
    this.resetData(false);
    try {
      let saved = JSON.parse(localStorage.getItem('ngage-demo-data') || 'null');
      if (saved) {
        this.rows = { ...this.rows, ...saved.rows };
        this.regs = saved.regs || this.regs;
        this.drafts = saved.drafts || {};
        this.grants = saved.grants || {};
        this.configs = saved.configs || {};
      }
    } catch {}
  }
  get role() {
    return this.auth.session?.role || '';
  }
  get roleName() {
    return this.labelRole(this.role);
  }
  labelRole(r: string) {
    return r === 'Super User' ? 'Platform Admin' : r;
  }
  get entities() {
    return isPlatformAdmin(this.role) ? PLATFORM_ADMIN_ENTITIES : [];
  }
  get flowKeys() {
    return isPlatformAdmin(this.role) ? PLATFORM_ADMIN_WORKFLOWS : [];
  }
  can(k: string) {
    return this.flowKeys.includes(k);
  }
  accessible(k: string) {
    return this.entities.includes(k);
  }
  resetData(persist = true) {
    this.rows = Object.fromEntries(
      Object.entries(this.m.entities).map(([k, e]: any) => [k, copy(e.seed)]),
    );
    this.regs = copy(this.m.registrants);
    this.drafts = {};
    this.grants = {};
    this.configs = {};
    this.notice = 'Demo data reset.';
    if (persist) this.persist();
  }
  persist() {
    try {
      localStorage.setItem(
        'ngage-demo-data',
        JSON.stringify({
          rows: this.rows,
          regs: this.regs,
          drafts: this.drafts,
          grants: this.grants,
          configs: this.configs,
        }),
      );
    } catch {
      this.error = 'Browser storage is full. Export or reset demo data.';
    }
  }
  dashboard() {
    this.view = 'dashboard';
    this.key = '';
    this.wizard = null;
    this.error = '';
    this.notice = '';
    this.reportPage = 1;
    this.openSection = null;
    this.mobileMenu = false;
  }
  nav(k: string) {
    if (!this.accessible(k)) {
      this.error = 'This workspace is not available to this role.';
      return;
    }
    this.wizard = null;
    this.selected = null;
    this.key = k;
    this.view =
      k === 'CallingTracker'
        ? 'report'
        : k === 'AttendanceReport'
          ? 'report'
          : k === 'Reports'
            ? 'report'
            : 'list';
    this.reportType =
      k === 'CallingTracker'
        ? 'calling'
        : /DB /.test(this.role) && k === 'Reports'
          ? 'department'
          : 'attendance';
    this.notice = '';
    this.error = '';
    this.search = '';
    this.search2 = '';
    this.reportPage = 1;
    this.mobileMenu = false;
    this.openFor(k);
  }
  toggleSection(title: string) {
    this.openSection = this.openSection === title ? null : title;
  }
  openFor(k: string) {
    this.openSection =
      this.m.menuGroups.find(([title, keys]: any) => keys.includes(k))?.[0] || null;
  }
  groupIcon(title: string) {
    return (
      (
        {
          Clients: 'clients',
          Events: 'events',
          'DB Workspace': 'database',
          'Assets & Handover': 'assets',
          'Response Workspace': 'response',
          Registrations: 'registration',
          'Reports & Tracking': 'reports',
          'Manage Access': 'access',
          'Master Data': 'settings',
          'Permission Settings': 'access',
        } as any
      )[title] || 'item'
    );
  }
  itemIcon(k: string) {
    if (['Admin', 'Agents', 'Contacts', 'AudienceContacts'].includes(k)) return 'profile';
    if (['CallingTracker', 'AttendanceReport', 'Reports'].includes(k)) return 'reports';
    if (this.m.masters.includes(k)) return 'settings';
    return this.groupIcon(
      this.m.menuGroups.find(([title, keys]: any) => keys.includes(k))?.[0] || '',
    );
  }
  canExportList(k: string) {
    return (
      !(
        this.role === 'Telecaller' &&
        ['Calling', 'CallingAssign', 'Updates', 'AudienceContacts'].includes(k)
      ) && !(k === 'Sample' && this.role !== 'DB Manager')
    );
  }
  exportReason(k: string) {
    return k === 'Sample'
      ? 'Sample downloads are not enabled for this role. Emails and phone numbers remain excluded.'
      : 'FRD M22: Telecallers cannot download or export contact lists.';
  }
  get menus() {
    return this.m.menuGroups
      .map(([title, keys]: any) => ({
        title,
        keys: keys.filter((k: string) => this.accessible(k)),
      }))
      .filter((g: any) => g.title !== 'Notifications' && g.keys.length);
  }
  tasks(k = this.key) {
    return this.flowKeys
      .filter((x: string) => this.m.flows[x].entity === k)
      .map((key: string) => ({ key, title: this.m.flows[key].title }));
  }
  get primaryTask() {
    return this.key === 'Admin' && this.can('Admin')
      ? 'Admin'
      : this.tasks().find((t: any) => t.key !== 'RolePermissions')?.key || '';
  }
  actionLabel(k: string) {
    return (
      (
        {
          RoleBuilder: 'Create New Role',
          Clients: 'Create Client',
          Events: 'Create New Event',
          Admin: 'Create User',
          Contacts: 'Add Client Representative',
          Agents: 'Add Telecaller',
          AudienceContacts: 'Add Event Contact',
          Assignment: 'Assign Managers',
          RegistrationForm: 'Configure Registration Form',
          Extraction: 'Extract & Prepare Sample',
          Sample: 'Share Sample',
          Lots: 'Create Lot & Handover',
          Reports: 'Prepare Report',
          AttendanceCheckin: 'Check In Attendee',
        } as any
      )[k] ||
      this.m.flows[k]?.title ||
      'Create Record'
    );
  }
  fields(f: any) {
    return f.steps.flatMap((s: any) => s.fields);
  }
  requirementsFocus = false;
  openTask(key: string, row: any = null) {
    if (!this.can(key)) {
      this.error = 'This role cannot perform this action.';
      return;
    }
    if (key === 'Requirements') {
      const target =
        row ||
        this.scopedEvents.find((candidate) => candidate.values[0] === this.event) ||
        this.scopedEvents[0];
      this.nav('Events');
      if (target) {
        this.viewRecord(target);
        this.requirementsFocus = true;
      } else this.error = 'Create or select an event first.';
      return;
    }
    let f = copy(this.m.flows[key]);
    if (key === 'Admin')
      f.steps = f.steps.filter(
        (step: any) => !step.fields.some((field: any) => field.label === 'Roles'),
      );
    if (key === 'Events')
      for (const step of f.steps)
        step.fields = step.fields.filter((field: any) => field.label !== 'Event Executives');
    if (key === 'Events' && this.eventEditor)
      for (const field of this.fields(f)) if (field.label === 'State') field.required = false;
    if (key === 'SampleFeedback' && this.role === 'Client Contact')
      f.steps.forEach((s: any) => {
        if (s.label === 'Decision')
          s.fields = s.fields.filter((x: any) =>
            ['Overall decision', 'Row decision', 'Remarks'].includes(x.label),
          );
      });
    let values = Object.fromEntries(this.fields(f).map((x: any) => [x.label, copy(x.value)]));
    if (row?.details) Object.assign(values, copy(row.details));
    if (key === 'Admin' && row) {
      values['Email'] = row.details?.Email || row.values[1];
      if (!values['First name'] || !row.details)
        values['First name'] = String(row.values[0]).split(' ')[0];
      if (!row.details) values['Display name'] = row.values[0];
    }
    if (key === 'Admin' && !row)
      for (const field of this.fields(f)) values[field.label] = field.multi ? [] : '';
    if (key === 'UserRoleGrant') {
      values['User'] = '';
      values['Email'] = '';
      values['Roles'] = [];
      values['Client'] = '';
      values['Event'] = '';
    }
    if (!row && ['Assignment', 'Agents', 'RegApproval', 'Clients', 'Events'].includes(key))
      for (const label of [
        'Managers',
        'Existing Telecaller',
        'Registrant',
        'Account Manager',
        'CS Managers',
        'Key Client Contacts',
      ])
        if (Object.hasOwn(values, label)) values[label] = Array.isArray(values[label]) ? [] : '';
    let grants = copy(row?.grants || []);
    if (
      !row &&
      [
        'RoleBuilder',
        'Admin',
        'Clients',
        'Events',
        'Agents',
        'AudienceContacts',
        'SessionAgenda',
      ].includes(key)
    ) {
      values[f.identity] = '';
      if (['Admin', 'AudienceContacts'].includes(key)) values['First name'] = '';
      if (key === 'Admin') values['Email'] = '';
    }
    if (key === 'RolePermissions') {
      values['Selected role'] = 'DB Manager';
      grants = copy(this.grants['DB Manager'] || ['dashboard.read', 'drf.read']);
    }
    this.wizard = {
      key,
      flow: f,
      row,
      values,
      grants,
      step: 0,
      visited: row ? f.steps.length - 1 : 0,
    };
    const draft = this.drafts[this.draftKey()];
    if (draft) {
      this.wizard = copy(draft);
      this.wizard.flow = f;
    }
    this.normaliseSelections();
    this.view = 'form';
    this.key = f.entity;
    this.error = '';
    this.notice = draft ? 'Draft restored.' : '';
    this.permissionQuery = '';
    this.mobileMenu = false;
    this.openFor(f.entity);
    if (key === 'RolePermissions') this.openSection = 'Permission Settings';
  }
  draftKey() {
    const w = this.wizard;
    return this.role + '|' + w.key + '|' + (w.row?.id || 'new');
  }
  get step() {
    return this.wizard?.flow.steps[this.wizard.step];
  }
  get identity() {
    return (
      this.wizard?.values[this.wizard.flow.identity] ||
      this.wizard?.values.Event ||
      'Name not entered'
    );
  }
  setField(f: any, value: any) {
    const w = this.wizard;
    if (!w) return;
    w.values[f.label] = value;
    if (w.key === 'UserRoleGrant' && f.label === 'User') {
      const user = this.userRow(value);
      w.values.Email = user?.values[1] || '';
      w.values.Roles = user?.details?.Roles || [];
    }
    if (f.label === 'Client' && ['RegistrationForm', 'UserRoleGrant', 'Events'].includes(w.key)) {
      if (Object.hasOwn(w.values, 'Event')) w.values.Event = '';
      if (w.key === 'Events') w.values['Key Client Contacts'] = [];
    }
    if (f.label === 'Manager role') w.values.Managers = [];
    if (w.key === 'Agents' && f.label === 'Existing Telecaller' && value !== 'Create new') {
      const agent = this.rows.Agents.find((row: any) => row.values[1] === value);
      if (agent)
        Object.assign(w.values, agent.details || {}, {
          Name: agent.values[0],
          Email: agent.values[1],
          'Agent ID': agent.values[2],
        });
    }
    if (
      ['First name', 'Last name'].includes(f.label) &&
      ['Admin', 'AudienceContacts'].includes(w.key)
    )
      w.values['Display name'] = [w.values['First name'], w.values['Last name']]
        .filter(Boolean)
        .join(' ');
    if (f.label === 'Role Name' && !w.row)
      w.values['Role Code'] = value.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    this.clearLocationChildren(f.label, w.values, this.fields(w.flow));
    if (f.label === 'Selected role') w.grants = copy(this.grants[value] || []);
    if (f.label === 'Wishlist targeted')
      w.values.Approach = value === 'No' ? 'Criteria-based only' : 'Wishlist only';
    if (f.label === 'User type')
      w.values['Authentication method'] =
        value === 'Shobiz / Tootl' ? 'Shobiz SSO' : 'Email & Password';
    if (f.label === 'Registration reference' && w.key === 'AttendanceCheckin') {
      const r = this.regs.find((x) => x.id === value || x.checkinToken === value);
      if (r) {
        w.values['Registration reference'] = r.id;
        w.values.Attendee = r.name;
        w.values['Approval status'] = r.approval;
        w.values['Confirmation status'] = r.confirmation;
        w.values['Attendance status'] = r.attendance;
      }
    }
  }
  userRow(email: string) {
    return this.rows.Admin.find((row: any) => row.values[1] === email);
  }
  roleOptions() {
    return [
      ...new Set<string>([
        ...this.m.roles,
        ...this.rows.RoleBuilder.filter((row: any) => row.values[4] === 'Active').map(
          (row: any) => row.values[0],
        ),
      ]),
    ];
  }
  optionLabel(f: any, value: string) {
    if (f.label === 'User') return (this.userRow(value)?.values[0] || value) + ' (' + value + ')';
    if (f.label === 'Registrant')
      return (this.regs.find((row) => row.id === value)?.name || value) + ' (' + value + ')';
    if (f.label === 'Existing Telecaller' && value !== 'Create new')
      return this.rows.Agents.find((row: any) => row.values[1] === value)?.values[0] || value;
    return ['Roles', 'Selected role'].includes(f.label) ? this.labelRole(value) : value;
  }
  usersWithRole(role: string) {
    return [
      ...this.rows.Admin.filter(
        (row: any) =>
          row.values[4] === 'Active' && (row.details?.Roles || [row.values[2]]).includes(role),
      ).map((row: any) => row.values[0]),
      ...this.auth.users
        .filter((user) => user.roles.includes(role) && !this.userRow(user.email))
        .map((user) => user.name),
    ];
  }
  options(f: any): string[] {
    let choices = f.options || [];
    const { key, values } = this.wizard;
    const active = (entity: string) =>
      this.rows[entity].filter((row: any) => row.values[4] === 'Active');
    if (this.isLocation(f.label)) return this.locationOptions(f.label, values);
    const master: any = {
      Industry: ['Industries', 'Industry name'],
      Segment: ['Segments', 'Segment name'],
      Department: ['Departments', 'Department name'],
      'Profile Level': ['ProfileLevels', 'Profile level name'],
    };
    if (master[f.label]) {
      const [entity, label] = master[f.label];
      choices = active(entity).map((row: any) => row.details[label]);
    }
    switch (f.label) {
      case 'User':
        if (key === 'UserRoleGrant') choices = this.rows.Admin.map((row: any) => row.values[1]);
        break;
      case 'Roles':
      case 'Selected role':
        choices = this.roleOptions();
        break;
      case 'Account Manager':
        choices = this.usersWithRole('Account Manager');
        break;
      case 'CS Managers':
        choices = this.usersWithRole('Client Servicing Manager');
        break;
      case 'Managers':
        choices = this.usersWithRole(values['Manager role']);
        break;
      case 'Key Client Contacts':
        choices = this.rows.Contacts.filter(
          (row: any) =>
            (row.details?.Client || row.values[3]) === values['Client'] &&
            row.values[4] === 'Active',
        ).map((row: any) => row.values[0]);
        break;
      case 'Existing Telecaller':
        choices = ['Create new', ...active('Agents').map((row: any) => row.values[1])];
        break;
      case 'Registrant':
        if (key === 'RegApproval')
          choices = this.regs
            .filter((row) => row.event === this.event && row.registered)
            .map((row) => row.id);
        break;
      case 'Client':
      case 'Company':
        if (f.options?.length) choices = this.rows.Clients.map((row: any) => row.values[0]);
        break;
      case 'Event':
        if (f.options?.length)
          choices = [
            ...(key === 'RegistrationForm' ? ['Client default'] : []),
            ...this.scopedEvents
              .filter(
                (row) =>
                  !['RegistrationForm', 'UserRoleGrant'].includes(key) ||
                  (!!values['Client'] && row.details?.Client === values['Client']),
              )
              .map((row) => row.values[0]),
          ];
        break;
    }
    return [...new Set<string>(choices.filter(Boolean))];
  }
  isLocation(label: string) {
    return ['Country', 'State', 'District', 'City', 'Assigned cities'].includes(label);
  }

  locationOptions(label: string, values: any): string[] {
    const active = (key: string) => this.rows[key].filter((row: any) => row.values[4] === 'Active');
    const inCountry = (row: any) => row.details.Country === values.Country;
    const inState = (row: any) =>
      inCountry(row) &&
      (row.details.State === values.State ||
        (!values.State && this.wizard?.key === 'Events' && this.eventEditor));
    const districts = [values.District].flat().filter(Boolean);
    const sources: Record<string, () => any[]> = {
      Country: () => active('Countries').map((row: any) => row.details['Country name']),
      State: () =>
        active('States')
          .filter(inCountry)
          .map((row: any) => row.details['State name']),
      District: () =>
        active('Districts')
          .filter(inState)
          .map((row: any) => row.details['District name']),
      City: () =>
        active('Cities')
          .filter(inState)
          .filter((row: any) => !districts.length || districts.includes(row.details.District))
          .map((row: any) => row.details['City name']),
    };
    return [...new Set(sources[label === 'Assigned cities' ? 'City' : label]().filter(Boolean))];
  }

  clearLocationChildren(label: string, values: any, fields: any[] = []) {
    const children: Record<string, string[]> = {
      Country: ['State', 'District', 'City', 'Assigned cities'],
      State: ['District', 'City', 'Assigned cities'],
      District: ['City', 'Assigned cities'],
    };
    for (const child of children[label] || []) {
      if (!Object.hasOwn(values, child)) continue;
      values[child] = fields.find((field) => field.label === child)?.multi ? [] : '';
    }
  }

  normaliseSelections() {
    const { flow, values } = this.wizard;
    for (const field of this.fields(flow)) {
      if (!field.options?.length) continue;
      const value = values[field.label];
      if (field.multi) values[field.label] = [value].flat().filter(Boolean);
      else if (Array.isArray(value)) values[field.label] = value[0] || '';
    }
  }

  optionHint(field: any) {
    if (field.label === 'State' && !this.wizard.values.Country) return 'Select a country first.';
    if (
      this.isLocation(field.label) &&
      !['Country', 'State'].includes(field.label) &&
      !this.wizard.values.State
    )
      return 'Select a state first.';
    return 'No options are available for this selection. Check the parent selection or add an active master record.';
  }
  locked(f: any) {
    const w = this.wizard;
    return (
      (['Admin', 'UserRoleGrant'].includes(w.key) &&
        f.label === 'Email' &&
        (w.key === 'UserRoleGrant' || !!w.row)) ||
      (w.key === 'Calling' && this.step.label === 'Contact') ||
      (w.key === 'DRF' && ['Event', 'Country', 'State', 'City', 'Venue'].includes(f.label)) ||
      (w.key === 'Events' && w.row && f.label === 'Client') ||
      (w.key === 'AudienceContacts' &&
        [
          'Registration status',
          'Approval status',
          'Confirmation status',
          'Attendance status',
        ].includes(f.label))
    );
  }
  isTextarea(f: any) {
    return /remark|description|brief|instruction|consent text/i.test(f.label);
  }
  valid() {
    for (const f of this.step.fields) {
      const v = this.wizard.values[f.label];
      if (f.required && (!v || (Array.isArray(v) && !v.length))) {
        this.error = f.label + ' is required.';
        return false;
      }
      if (
        f.options?.length &&
        [
          'User',
          'Roles',
          'Selected role',
          'Registrant',
          'Managers',
          'Existing Telecaller',
          'Event',
          'Key Client Contacts',
          'Account Manager',
          'CS Managers',
          'Country',
          'State',
          'District',
          'City',
          'Assigned cities',
        ].includes(f.label) &&
        [v]
          .flat()
          .filter(Boolean)
          .some((value) => !this.options(f).includes(value))
      ) {
        this.error = 'Select a valid ' + f.label + ' for this location.';
        return false;
      }
      if (f.kind === 'email' && v && !/^[^ @]+@[^ @]+\.[^ @]+$/.test(v)) {
        this.error = 'Enter a valid ' + f.label + '.';
        return false;
      }
    }
    const v = this.wizard.values;
    if (
      v['Event Start Date'] &&
      v['Event End Date'] &&
      v['Event Start Date'] > v['Event End Date']
    ) {
      this.error = 'End date must be on or after start date.';
      return false;
    }
    this.error = '';
    return true;
  }
  next() {
    if (!this.valid()) return;
    this.wizard.step++;
    this.wizard.visited = Math.max(this.wizard.visited, this.wizard.step);
  }
  back() {
    this.wizard.step = Math.max(0, this.wizard.step - 1);
    this.error = '';
  }
  tab(i: number) {
    if (i > this.wizard.visited) return;
    if (i > this.wizard.step && !this.valid()) return;
    this.wizard.step = i;
    this.error = '';
  }
  saveDraft() {
    this.drafts[this.draftKey()] = copy(this.wizard);
    this.persist();
    this.notice = 'Draft saved in this browser.';
  }
  cancel() {
    const k = this.wizard.flow.entity;
    this.wizard = null;
    this.view = 'list';
    this.key = k;
    this.error = '';
    this.notice = 'Returned to list. Saved drafts remain available.';
  }
  save() {
    const w = this.wizard;
    for (let i = 0; i < w.flow.steps.length; i++) {
      w.step = i;
      if (!this.valid()) return;
    }
    if (w.key === 'RolePermissions') {
      this.grants[w.values['Selected role']] = copy(w.grants);
      this.notice = 'Permissions saved for ' + w.values['Selected role'];
      this.wizard = null;
      this.view = 'list';
      this.persist();
      return;
    }
    let reg: any;
    if (w.key === 'AttendanceCheckin') {
      reg = this.regs.find((r) => r.id === w.values['Registration reference']);
      if (!reg || reg.approval !== 'Approved') {
        this.error =
          'An approved registration is required before check-in. Walk-ins must register and satisfy the event policy first.';
        return;
      }
    }
    if (w.key === 'UserRoleGrant') {
      const user = this.userRow(w.values.User);
      if (!user || user.values[1] !== w.values.Email) {
        this.error = 'Select a saved user.';
        return;
      }
      Object.assign((user.details ??= {}), {
        'Authentication method': w.values['Authentication method'],
        Roles: copy(w.values.Roles),
        'Access assignment': copy(w.values),
      });
      user.values[2] = w.values.Roles.map((role: string) => this.labelRole(role)).join(', ');
      user.values[3] = w.values.Event || w.values.Client || 'Platform';
      user.values[4] = 'Active';
      this.auth.upsertDemoUser(
        user.values[1],
        user.values[0],
        w.values.Roles,
        w.values['Authentication method'],
      );
      delete this.drafts[this.draftKey()];
      this.wizard = null;
      this.view = 'list';
      this.notice = 'Access saved for ' + user.values[0];
      this.persist();
      return;
    }
    if (
      w.key === 'Admin' &&
      this.rows.Admin.some(
        (row: any) =>
          row.id !== w.row?.id &&
          String(row.values[1]).toLowerCase() === String(w.values.Email).trim().toLowerCase(),
      )
    ) {
      this.error = 'A user with this email already exists.';
      return;
    }
    if (
      w.key === 'RegApproval' &&
      !['Approved', 'Rejected', 'Declined', 'Pending', 'On Hold'].includes(
        w.values.Decision || w.values.Outcome,
      )
    ) {
      this.error = 'Select an approval decision.';
      return;
    }
    const registration =
      w.key === 'RegApproval'
        ? this.regs.find(
            (r) => r.id === w.values.Registrant && r.event === this.event && r.registered,
          )
        : null;
    if (w.key === 'RegApproval' && !registration) {
      this.error = 'Select a saved registration for this event.';
      return;
    }
    const existingAgent =
      w.key === 'Agents'
        ? this.rows.Agents.find(
            (candidate: any) => candidate.values[1] === w.values['Existing Telecaller'],
          )
        : null;
    const k = w.flow.entity,
      e = this.m.entities[k],
      row = w.row ||
        existingAgent || {
          id: k + '-' + Date.now(),
          values: copy(e.seed[0].values),
          created: new Date().toISOString(),
          history: [],
        };
    row.details = w.key === 'Admin' ? { ...row.details, ...copy(w.values) } : copy(w.values);
    row.flow = w.key;
    row.values[0] = String(w.values[w.flow.identity] || row.values[0]);
    if (!w.row)
      row.values[4] =
        ['Admin', 'Clients', 'Agents', 'Senders'].includes(k) || this.m.masters.includes(k)
          ? 'Active'
          : 'Draft';
    if (w.key === 'RoleBuilder') {
      row.grants = copy(w.grants);
      row.details['Granted permissions'] = copy(w.grants);
      row.values = [
        w.values['Role Name'],
        w.values.Description,
        w.grants.length + ' granted',
        'Separate client/event assignments',
        'Active',
      ];
      this.grants[w.values['Role Name']] = copy(w.grants);
    }
    const cityColumn = e.columns.indexOf('City');
    if (cityColumn >= 0 && !this.m.masters.includes(k) && Object.hasOwn(w.values, 'City')) {
      row.values[cityColumn] = [w.values.City].flat().filter(Boolean).join(', ');
    }
    if (w.key === 'Admin') {
      const roles = row.details.Roles || [];
      row.values = [
        w.values['Display name'] ||
          [w.values['First name'], w.values['Last name']].filter(Boolean).join(' '),
        String(w.values.Email).trim().toLowerCase(),
        roles.map((role: string) => this.labelRole(role)).join(', '),
        row.details['Access assignment']?.Event || w.values.Client || '',
        roles.length ? 'Active' : 'Pending',
      ];
    }
    if (w.key === 'Contacts')
      row.values = [
        w.values.Name,
        w.values.Email || '',
        w.values.Designation || '',
        w.values.Client,
        'Active',
      ];
    if (w.key === 'Agents')
      row.values = [
        w.values.Name,
        w.values.Email,
        w.values['Agent ID'],
        w.values.City,
        w.values['Account status'] || 'Active',
      ];
    if (w.key === 'RegistrationForm')
      this.configs[w.values.Client + '|' + w.values.Event] = {
        rules: copy(w.values['Field rules']),
        path: w.values['Public registration path'],
        status: w.values['Form status'],
        message: w.values['Thank-you message'],
        logo: w.values['Client logo preview'],
        banner: w.values['Banner preview'],
        consent: w.values['Consent text'],
      };
    if (w.key === 'RegApproval') {
      const r = registration;
      if (r) {
        r.approval = w.values.Decision || w.values.Outcome || r.approval;
        if (['Approved', 'Declined', 'Rejected'].includes(r.approval)) {
          r.decidedAt = new Date().toISOString();
          r.decidedBy = w.values.Approver || this.auth.session?.name;
          r.clientApprover =
            w.values.Approver || (this.role === 'Client Contact' ? this.auth.session?.name : '');
        }
      }
    }
    this.notice = (w.row ? 'Updated' : 'Saved') + ' successfully: ' + row.values[0];
    if (reg) {
      if (reg.attendance === 'Checked in')
        this.notice =
          'Already checked in at ' + reg.checkinAt + '. No duplicate attendance created.';
      else {
        reg.attendance = 'Checked in';
        reg.checkinAt = new Date().toISOString();
        this.notice = 'Check-in recorded for ' + reg.name;
      }
    }
    row.history.push({
      Action: w.row ? 'Updated' : 'Created',
      User: this.roleName,
      Date: new Date().toISOString(),
    });
    if (!w.row && !existingAgent) this.rows[k].unshift(row);
    delete this.drafts[this.draftKey()];
    this.wizard = null;
    this.view = 'list';
    this.key = k;
    this.persist();
  }
  get scopedEvents(): any[] {
    const email = this.auth.session?.email;
    if (this.role === 'Client Contact')
      return email === 'clientcontact@demo.local'
        ? this.rows.Events.filter((row: any) => row.details?.Client === 'Northstar Technologies')
        : [];
    if (this.role !== 'Event Executive' || email === 'eventexecutive@demo.local')
      return this.rows.Events;
    let assignments: any = {};
    try {
      assignments = JSON.parse(localStorage.getItem('ngage-event-dashboard') || '{}');
    } catch {}
    return this.rows.Events.filter((row: any) =>
      assignments[row.id]?.executives?.some((user: any) => user.email === email),
    );
  }
  get listRows() {
    return this.key === 'Events' ? this.scopedEvents : this.rows[this.key];
  }
  viewRecord(row: any) {
    this.requirementsFocus = false;
    if (this.key === 'Events' && !this.scopedEvents.includes(row)) return;
    if (this.key === 'Events') this.event = row.values[0];
    this.selected = row;
    this.wizard = null;
    this.view = 'detail';
  }
  editRecord(row: any) {
    const tasks = this.tasks();
    const k =
      this.key === 'Admin' && this.can('Admin')
        ? 'Admin'
        : tasks.find((t: any) => t.key === row.flow)?.key || tasks[0]?.key;
    if (k) this.openTask(k, row);
  }
  remove(row: any) {
    if (!['Draft', 'New'].includes(row.values[4]) || !this.tasks().length) return;
    if (!confirm('Delete this unsubmitted draft?')) return;
    this.rows[this.key] = this.rows[this.key].filter((r: any) => r.id !== row.id);
    this.persist();
    this.notice = 'Draft deleted; submitted history is retained.';
  }
  toggle(row: any) {
    if (
      !this.accessible(this.key) ||
      !this.m.masters.includes(this.key) ||
      !this.rows[this.key].includes(row)
    )
      return;
    row.values[4] = row.values[4] === 'Active' ? 'Inactive' : 'Active';
    this.persist();
    this.notice = 'Master status updated.';
  }
  get reviewSections() {
    const f = this.wizard?.flow || this.m.flows[this.selected?.flow];
    return (f?.steps || []).filter((s: any) => s.label !== 'Review');
  }
  get reviewValues() {
    return this.wizard?.values || this.selected?.details || {};
  }
  value(f: any) {
    const v = this.reviewValues[f.label];
    return v === undefined || v === null || v === '' ? 'Not provided' : v;
  }
  isRecordArray(v: any) {
    return Array.isArray(v) && v.length && typeof v[0] === 'object';
  }
  isArray(v: any) {
    return Array.isArray(v);
  }
  recordHeaders(v: any) {
    return v.length ? Object.keys(v[0]) : [];
  }
  recordRows(v: any) {
    return v.map((r: any) => Object.values(r));
  }
  historyRows() {
    return (this.selected?.history || []).map((x: any) => Object.values(x));
  }
  get permissionModules() {
    return [
      ...new Set(
        this.m.permissions
          .filter((p: any) =>
            (p.label + ' ' + p.module + ' ' + p.code)
              .toLowerCase()
              .includes(this.permissionQuery.toLowerCase()),
          )
          .map((p: any) => p.module),
      ),
    ];
  }
  modulePermissions(mod: any) {
    return this.m.permissions.filter(
      (p: any) =>
        p.module === mod &&
        (p.label + ' ' + p.code).toLowerCase().includes(this.permissionQuery.toLowerCase()),
    );
  }
  hasGrant(code: string) {
    return this.wizard.grants.includes(code);
  }
  grant(code: string, on: boolean) {
    this.wizard.grants = on
      ? [...new Set([...this.wizard.grants, code])]
      : this.wizard.grants.filter((x: string) => x !== code);
  }
  permissionRows() {
    const g =
      this.wizard?.grants ||
      this.selected?.grants ||
      this.reviewValues['Granted permissions'] ||
      [];
    return this.m.permissions.map((p: any) => [
      p.module,
      p.label,
      p.code,
      g.includes(p.code) ? 'True' : 'False',
    ]);
  }
  async file(f: any, event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.error = 'Choose a file smaller than 2 MB for the local demo.';
      return;
    }
    if (f.kind === 'image' && !file.type.startsWith('image/')) {
      this.error = 'Choose an image file.';
      return;
    }
    this.setField(f, file.name);
    if (f.kind === 'image') {
      this.wizard.values[f.label + ' preview'] = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
    }
  }
  updateRule(i: number, key: string, val: any) {
    const r = this.wizard.values['Field rules'][i];
    r[key] = val;
    if (!r.Visible) r.Required = false;
  }
  addRule() {
    const fields = [
      'First name',
      'Last name',
      'Email',
      'Mobile',
      'Employer',
      'Designation',
      'Country',
      'State',
      'City',
      'Dietary preference',
      'Accessibility needs',
      'Interests',
    ];
    const f = fields.find(
      (x) => !this.wizard.values['Field rules'].some((r: any) => r.Field === x),
    );
    if (f)
      this.wizard.values['Field rules'].push({
        Field: f,
        Visible: true,
        Required: false,
        Order: this.wizard.values['Field rules'].length + 1,
      });
  }
  addSocial(f: any) {
    this.wizard.values[f.label].push({ Platform: '', URL: '' });
  }
  get eventEditor() {
    return ['Account Manager', 'Client Servicing Manager'].includes(this.role);
  }
  get eventNames() {
    return this.scopedEvents.map((r: any) => r.values[0]);
  }
  get client() {
    return (
      this.rows.Events.find((e: any) => e.values[0] === this.event)?.details?.Client ||
      'Northstar Technologies'
    );
  }
  get eventData() {
    return this.regs.filter(
      (r) =>
        r.event === this.event && (this.role !== 'Telecaller' || r.telecaller === 'Neha Singh'),
    );
  }
  get counters() {
    const a = this.eventData;
    const registered = a.filter((r) => r.registered),
      attended = a.filter((r) => r.attendance === 'Checked in'),
      called = a.filter((r) => r.attempts > 0);
    return {
      assigned: a.length,
      called: called.length,
      attempts: a.reduce((n, r) => n + r.attempts, 0),
      pending: a.length - called.length,
      registered: registered.length,
      approved: registered.filter((r) => r.approval === 'Approved').length,
      attended: attended.length,
      regAttended: attended.filter((r) => r.registered).length,
      walkins: attended.filter((r) => !r.registered && r.walkin).length,
      notAttended: registered.filter((r) => r.attendance !== 'Checked in').length,
    };
  }
  get metrics() {
    const c = this.counters;
    if (this.role === 'Telecaller')
      return [
        { label: 'My assigned contacts', value: c.assigned, target: 'calling' },
        { label: 'Unique contacts called', value: c.called, target: 'called' },
        { label: 'Pending contacts', value: c.pending, target: 'pending' },
        { label: 'Call attempts', value: c.attempts, target: 'calling' },
      ];
    if (/DB /.test(this.role))
      return ['DRF', 'Sample', 'Lots', 'Returns']
        .filter((k) => this.accessible(k))
        .map((k) => ({
          label: this.m.entities[k].label,
          value: this.rows[k].length,
          target: 'entity:' + k,
        }));
    if (['Super User', 'Platform Admin'].includes(this.role))
      return ['Clients', 'Events', 'Admin']
        .filter((k) => this.accessible(k))
        .map((k) => ({
          label: this.m.entities[k].label,
          value: this.rows[k].length,
          target: 'entity:' + k,
        }))
        .concat([
          {
            label: 'Registered / attended',
            value: c.registered + ' / ' + c.regAttended,
            target: 'attendance',
          },
        ] as any);
    return [
      { label: 'Registered', value: c.registered, target: 'registered' },
      { label: 'Approved', value: c.approved, target: 'approved' },
      { label: 'Actually attended', value: c.attended, target: 'attended' },
      { label: 'Registered, not attended', value: c.notAttended, target: 'notAttended' },
    ];
  }
  openRoleReports() {
    this.view = 'role-reports';
    this.openSection = 'Reports & Tracking';
    this.key = '';
    this.wizard = null;
    this.selected = null;
    this.notice = '';
    this.error = '';
    this.mobileMenu = false;
  }
  reportList() {
    this.nav('Reports');
    this.view = 'list';
  }
  openReport(kind: string) {
    if (kind.startsWith('entity:')) return this.nav(kind.slice(7));
    this.view = 'report';
    this.wizard = null;
    this.reportType = kind;
    this.search = '';
    this.search2 = '';
    this.reportPage = 1;
  }
  get reportData() {
    let a = this.eventData;
    if (this.agent !== 'All') a = a.filter((r) => r.telecaller === this.agent);
    if (['calling', 'called', 'pending'].includes(this.reportType) && this.date)
      a = a.filter((r) => !r.lastCall || r.lastCall === this.date);
    if (this.reportType === 'pending') a = a.filter((r) => !r.attempts);
    if (this.reportType === 'called') a = a.filter((r) => r.attempts > 0);
    if (this.reportType === 'registered') a = a.filter((r) => r.registered);
    if (this.reportType === 'approved')
      a = a.filter((r) => r.registered && r.approval === 'Approved');
    if (this.reportType === 'attended') a = a.filter((r) => r.attendance === 'Checked in');
    if (this.reportType === 'notAttended')
      a = a.filter((r) => r.registered && r.attendance !== 'Checked in');
    return a.filter(
      (r) =>
        Object.values(r).join(' ').toLowerCase().includes(this.search.toLowerCase()) &&
        Object.values(r).join(' ').toLowerCase().includes(this.search2.toLowerCase()),
    );
  }
  get calling() {
    return ['calling', 'called', 'pending'].includes(this.reportType);
  }
  get reportHeaders() {
    return this.calling
      ? ['Telecaller', 'Contact', 'Event', 'Attempts', 'Status', 'Last call']
      : [
          'Registration',
          'Attendee',
          'Employer',
          'Registered',
          'Approval',
          'Confirmation',
          'Attendance',
          'Walk-in',
        ];
  }
  get reportRows() {
    const pii = this.calling
      ? ['Response Manager', 'Response Head', 'Telecaller'].includes(this.role)
      : !['Super User', 'Platform Admin', 'DB Head', 'DB Manager'].includes(this.role);
    return this.reportData.map((r) =>
      this.calling
        ? [
            r.telecaller,
            pii ? r.name : 'Restricted',
            r.event,
            r.attempts,
            r.status,
            r.lastCall || 'Not called',
          ]
        : [
            r.id,
            pii ? r.name : 'Restricted',
            r.company,
            r.registered ? 'Yes' : 'No',
            r.approval,
            r.confirmation,
            r.attendance,
            r.walkin ? 'Yes' : 'No',
          ],
    );
  }
  get reportStats() {
    if (this.calling) {
      const a = this.reportData;
      return [
        ['Assigned contacts in view', a.length],
        ['Unique called', a.filter((r) => r.attempts > 0).length],
        ['Call attempts', a.reduce((n, r) => n + r.attempts, 0)],
        ['Pending', a.filter((r) => !r.attempts).length],
      ];
    }
    const c = this.counters;
    return [
      ['Registered', c.registered],
      ['Registered & attended', c.regAttended],
      ['Registered, not attended', c.notAttended],
      ['Walk-ins attended', c.walkins],
      ['Total attended', c.attended],
    ];
  }
  get assignmentRows() {
    return this.rows.Assignment.map((r: any) => r.values);
  }
  get teamRows() {
    return ['Neha Singh', 'Arjun Das'].map((n) => {
      const a = this.eventData.filter((r) => r.telecaller === n);
      return [
        n,
        a.length,
        a.filter((r) => r.attempts > 0).length,
        a.reduce((n, r) => n + r.attempts, 0),
        a.filter((r) => !r.attempts).length,
      ];
    });
  }
  get sampleRows() {
    return this.m.sampleRows
      .map((r: any) => [
        r.company,
        r.industry,
        r.segment,
        r.city,
        r.designation,
        r.Department,
        r['Profile Level'],
        r['Wishlist match'],
        r.Remarks,
      ])
      .filter(
        (r: any) =>
          r.join(' ').toLowerCase().includes(this.search.toLowerCase()) &&
          r.join(' ').toLowerCase().includes(this.search2.toLowerCase()),
      );
  }
  sample(row: any) {
    this.selected = row;
    this.view = 'sample';
    this.search = '';
    this.search2 = '';
  }
  slug(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  async eventQr(row: any) {
    this.selected = row;
    this.event = row.values[0];
    this.view = 'qr';
    const client = row.details?.Client || 'Northstar Technologies';
    const configured =
      this.configs[client + '|' + row.values[0]]?.path || row.details?.['Public registration path'];
    const path =
      configured?.startsWith('/') && configured.endsWith('/registration')
        ? configured
        : '/' + this.slug(client) + '/' + this.slug(row.values[0]) + '/registration';
    this.publicPath = path;
    this.qrImage = await QRCode.toDataURL(location.origin + path, { width: 220, margin: 2 });
  }
  publicPath = '/northstar-technologies/northstar-roadshow/registration';
  get publicUrl() {
    return location.origin + this.publicPath;
  }
  async previewQr() {
    this.qrImage = await QRCode.toDataURL(this.publicUrl, { width: 220, margin: 2 });
  }
  get publicConfig() {
    return (
      this.configs[this.publicClient + '|' + this.publicEvent] ||
      this.configs[this.publicClient + '|Client default'] || {
        rules: this.m.flows.RegistrationForm.steps[1].fields[0].value,
        status: 'Published',
        message: 'Your registration has been received.',
      }
    );
  }
  get publicLogo() {
    return (
      this.publicConfig.logo ||
      this.rows.Clients.find((r: any) => r.values[0] === this.publicClient)?.details?.[
        'Client logo preview'
      ]
    );
  }
  get publicBanner() {
    return (
      this.publicConfig.banner ||
      this.rows.Clients.find((r: any) => r.values[0] === this.publicClient)?.details?.[
        'Client banner preview'
      ]
    );
  }
  get publicFields() {
    const fields = this.publicConfig.rules
      .filter((rule: any) => rule.Visible)
      .sort((a: any, b: any) => a.Order - b.Order);
    const hierarchy = ['Country', 'State', 'City'];
    const last = Math.max(...fields.map((field: any) => hierarchy.indexOf(field.Field)), -1);
    if (last < 0) return fields;
    const requiredParents = hierarchy
      .slice(0, last)
      .map((Field) => ({ Field, Visible: true, Required: true }));
    const locationFields = [
      ...requiredParents,
      fields.find((field: any) => field.Field === hierarchy[last]),
    ];
    const first = fields.findIndex((field: any) => hierarchy.includes(field.Field));
    return [
      ...fields.slice(0, first),
      ...locationFields,
      ...fields.slice(first).filter((field: any) => !hierarchy.includes(field.Field)),
    ];
  }

  registerPublic(values: any, consent: boolean) {
    this.error = '';
    if (!consent) {
      this.error = 'Please accept the event consent terms.';
      return false;
    }
    for (const f of this.publicFields) {
      if (f.Required && !String(values[f.Field] || '').trim()) {
        this.error = f.Field + ' is required.';
        return false;
      }
      if (
        this.isLocation(f.Field) &&
        values[f.Field] &&
        !this.locationOptions(f.Field, values).includes(values[f.Field])
      ) {
        this.error = 'Select a valid ' + f.Field + ' for this location.';
        return false;
      }
    }
    const email = (values['Email'] || '').trim().toLowerCase();
    let r = email
      ? this.regs.find((r) => r.event === this.publicEvent && r.email.toLowerCase() === email)
      : null;
    if (r && r.registered) this.receipt = { id: r.id, duplicate: true };
    else if (r) {
      r.registered = true;
      r.registeredAt = new Date().toISOString();
      r.approval = 'Pending';
      this.receipt = { id: r.id };
    } else {
      r = {
        id: 'REG-' + Date.now(),
        name: [values['First name'], values['Last name']].filter(Boolean).join(' '),
        company: values.Employer || '',
        email,
        mobile: values.Mobile || '',
        event: this.publicEvent,
        client: this.publicClient,
        registered: true,
        registeredAt: new Date().toISOString(),
        approval: 'Pending',
        confirmation: 'Awaiting response',
        attendance: 'Not checked in',
        walkin: false,
        attempts: 0,
        telecaller: 'Unassigned',
        country: values.Country || '',
        state: values.State || '',
        city: values.City || '',
        consent: true,
      };
      this.regs.push(r);
      this.receipt = { id: r.id };
    }
    this.persist();
    return true;
  }
}
