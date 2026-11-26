import {
  NgageInput,
  NgageButton,
  NgageAlert,
  NgageChoice,
} from '../../../../shared/design-system/index';
import { Component, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { exportTable, exportHistory } from '../../../../shared/utils/platform-admin/export';
import { RoleReportsComponent, RoleReportState } from '../role-reports/role-reports.component';
import { audienceAccess, audienceReports, entityReports } from '../role-reports/role-reports';
@Component({
  selector: 'app-reports-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    NgageInput,
    NgageButton,
    NgageAlert,
    NgageChoice,
    CommonModule,
    FormsModule,
    RoleReportsComponent,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsPage {
  readonly s = inject(WorkspaceService);
  @ViewChild(RoleReportsComponent) summary?: RoleReportsComponent;
  summaryState: RoleReportState | null = null;
  reportKey = 'reconciliation';
  view = 'summary';
  format = 'xlsx';
  error = '';
  page = 1;
  size = 10;
  recipient = '';
  filters = {
    client: '',
    event: '',
    country: '',
    state: '',
    city: '',
    status: '',
    from: '',
    to: '',
    search: '',
    more: '',
  };
  readonly headers = [
    'Registration',
    'Attendee',
    'Employer',
    'Registered',
    'Approval',
    'Confirmation',
    'Attendance',
    'Walk-in',
    'Email',
    'Mobile',
  ];
  columns = [true, true, true, true, true, true, true, true, false, false];
  get catalog() {
    return [
      ...(audienceAccess[this.s.role] || []).map((key) => ({
        key,
        title: audienceReports[key][0],
      })),
      ...Object.entries(entityReports)
        .filter(([key]) => this.s.accessible(key))
        .map(([key, [title]]) => ({ key, title })),
    ];
  }
  changeView(view: string) {
    if (this.summary) this.summaryState = this.summary.snapshot;
    this.view = view;
  }
  get reportName() {
    return this.catalog.find((report) => report.key === this.reportKey)?.title || 'Reports';
  }
  get recordAvailable() {
    return ['reconciliation', 'attendance'].includes(this.reportKey);
  }
  selectReport() {
    this.summaryState = null;
    this.view = 'summary';
    this.recipient = '';
    this.error = '';
    this.page = 1;
  }
  get invalidRange() {
    return !!(this.filters.from && this.filters.to && this.filters.from > this.filters.to);
  }
  get facts() {
    if (this.invalidRange) return [];
    return this.s.regs.filter((row) =>
      Object.entries(this.filters).every(([key, value]) => {
        if (!value) return true;
        if (key === 'search' || key === 'more')
          return [
            row.id,
            row.name,
            row.company,
            row.email,
            row.mobile,
            row.approval,
            row.confirmation,
          ]
            .join(' ')
            .toLowerCase()
            .includes(value.trim().toLowerCase());
        if (key === 'status') return row.approval === value;
        if (key === 'from' || key === 'to') {
          const date = row.registeredAt?.slice(0, 10);
          return !!date && (key === 'from' ? date >= value : date <= value);
        }
        return row[key] === value;
      }),
    );
  }
  options(key: string): string[] {
    return [
      ...new Set<string>(
        this.s.regs
          .filter(
            (row) =>
              (key !== 'event' || !this.filters.client || row.client === this.filters.client) &&
              (!['state', 'city'].includes(key) ||
                !this.filters.country ||
                row.country === this.filters.country) &&
              (key !== 'city' || !this.filters.state || row.state === this.filters.state),
          )
          .map((row) => String(row[key] || ''))
          .filter(Boolean),
      ),
    ].sort();
  }
  setFilter(key: string, value: string) {
    Object.assign(this.filters, { [key]: value });
    if (key === 'client') this.filters.event = '';
    if (key === 'country') {
      this.filters.state = '';
      this.filters.city = '';
    }
    if (key === 'state') this.filters.city = '';
    this.page = 1;
    this.recipient = '';
  }
  clear() {
    this.filters = {
      client: '',
      event: '',
      country: '',
      state: '',
      city: '',
      status: '',
      from: '',
      to: '',
      search: '',
      more: '',
    };
    this.page = 1;
  }
  get indexes() {
    return this.columns.map((on, index) => (on ? index : -1)).filter((index) => index >= 0);
  }
  get today() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }
  started(event: string) {
    const row = this.s.rows.Events.find((row: any) => row.values[0] === event);
    return !!row?.details?.['Event Start Date'] && row.details['Event Start Date'] <= this.today;
  }
  closed(event: string) {
    const row = this.s.rows.Events.find((row: any) => row.values[0] === event);
    return (
      row?.values[4] === 'Completed' &&
      !!row.details?.['Event End Date'] &&
      row.details['Event End Date'] <= this.today
    );
  }
  values(row: any) {
    return [
      row.id,
      row.name,
      row.company,
      row.registered ? 'Yes' : 'No',
      row.approval,
      row.confirmation,
      this.started(row.event) ? row.attendance : 'Not started',
      row.walkin ? 'Yes' : 'No',
      row.email || '',
      row.mobile || '',
    ];
  }
  get pageRows() {
    this.page = Math.min(this.page, this.pages);
    return this.facts.slice((this.page - 1) * this.size, this.page * this.size);
  }
  get pages() {
    return Math.max(1, Math.ceil(this.facts.length / this.size));
  }
  get scope() {
    return (
      this.filters.event ||
      'All events: ' + new Set(this.facts.map((row) => row.event)).size + ' events'
    );
  }
  get stats() {
    const rows = this.facts;
    return [
      ['Registered', rows.filter((row) => row.registered).length],
      [
        'Registered and attended',
        rows.filter(
          (row) => row.registered && this.started(row.event) && row.attendance === 'Checked in',
        ).length,
      ],
      [
        'Registered, not attended (closed events)',
        rows.filter(
          (row) => row.registered && this.closed(row.event) && row.attendance !== 'Checked in',
        ).length,
      ],
      [
        'Walk-ins attended',
        rows.filter(
          (row) => row.walkin && this.started(row.event) && row.attendance === 'Checked in',
        ).length,
      ],
      [
        'Total attended',
        rows.filter((row) => this.started(row.event) && row.attendance === 'Checked in').length,
      ],
    ];
  }
  download() {
    if (!this.facts.length || !this.indexes.length || this.invalidRange) return;
    try {
      exportTable(
        this.format,
        this.reportName + ' - ' + this.scope,
        this.indexes.map((index) => this.headers[index]),
        this.facts.map((row) => this.indexes.map((index) => this.values(row)[index])),
        {
          user: this.s.auth.session?.email || 'Unrecorded',
          scope: this.scope,
          filters: { ...this.filters },
        },
      );
      this.error = '';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Export failed.';
    }
  }
  get history() {
    return exportHistory();
  }
  get activeClient() {
    return this.view === 'records'
      ? this.filters.client
      : (this.summary ? this.summary.filters().client : this.summaryState?.filters.client) || '';
  }
  get contacts() {
    return this.activeClient ? this.s.clientContacts(this.activeClient) : [];
  }
  share() {
    if (
      !this.activeClient ||
      !this.contacts.some((contact: { email: string }) => contact.email === this.recipient)
    ) {
      this.error = 'Filter the report to a client and choose one of its contacts.';
      return;
    }
    const summary = this.summary;
    if (
      this.view === 'summary' &&
      (!summary ||
        summary.invalidRange() ||
        !summary.groups().length ||
        !summary.columnIndexes.length)
    ) {
      this.error = 'There are no matching report rows to share.';
      return;
    }
    if (this.view === 'records' && (!this.facts.length || !this.indexes.length)) {
      this.error = 'Select report rows and columns first.';
      return;
    }
    const scope = this.view === 'records' ? this.scope : summary?.scopeTitle || '';
    const filters = this.view === 'records' ? this.filters : summary?.filters() || {};
    const columns =
      this.view === 'records'
        ? this.indexes.map((index) => this.headers[index])
        : summary?.columnIndexes.map((index) => summary.columnHeaders[index]) || [];
    if (this.s.prepareShare(this.reportName, this.recipient, scope, filters, columns))
      this.error = '';
  }
}
