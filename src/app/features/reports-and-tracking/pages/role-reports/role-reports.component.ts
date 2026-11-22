import { ViewEncapsulation, Component, computed, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { exportTable } from '../../../../shared/utils/platform-admin/export';
import {
  aggregate,
  audienceAccess,
  audienceReports,
  Dimension,
  dimensions,
  entityReports,
  reportDate,
  ReportFact,
} from './role-reports';

export type Filters = Record<Dimension | 'from' | 'to' | 'search' | 'more', string>;
export interface RoleReportState {
  filters: Filters;
  grain: string;
  breakdown: Dimension;
  page: number;
  pageSize: number;
  columns: boolean[];
}
const emptyFilters: Filters = {
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

@Component({
  selector: 'app-role-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-reports.component.html',
  // Preserve the existing CSS selectors and native admin scope.
  encapsulation: ViewEncapsulation.None,
  styleUrl: './role-reports.component.css',
})
export class RoleReportsComponent {
  @Input() embedded = false;
  @Input() set restoredState(state: RoleReportState | null) {
    if (!state) return;
    this.filters.set({ ...state.filters });
    this.grain.set(state.grain);
    this.breakdown.set(state.breakdown);
    this.page.set(state.page);
    this.pageSize.set(state.pageSize);
    this.columnFlags = [...state.columns];
  }
  get snapshot(): RoleReportState {
    return {
      filters: { ...this.filters() },
      grain: this.grain(),
      breakdown: this.breakdown(),
      page: this.page(),
      pageSize: this.pageSize(),
      columns: [...this.columnFlags],
    };
  }
  @Input() set reportKey(value: string) {
    if (value) this.select(value);
  }
  columnFlags = [true, true, true];
  get columnHeaders() {
    return ['Period (' + this.grain() + ')', dimensions[this.breakdown()], 'Records'];
  }
  get columnIndexes() {
    return this.columnFlags
      .map((enabled, index) => (enabled ? index : -1))
      .filter((index) => index >= 0);
  }
  rowValues(row: { period: string; group: string; count: number }) {
    return [row.period, row.group || 'Unspecified', row.count];
  }
  get scopeTitle() {
    const event = this.filters().event;
    if (event) return event;
    const events = new Set(
      this.filtered()
        .map((row) => row.event)
        .filter(Boolean),
    );
    return events.size
      ? 'All events: ' + events.size + ' events'
      : 'All matching records: ' + this.filtered().length;
  }

  s = inject(WorkspaceService);
  catalog = [
    ...(audienceAccess[this.s.role] || []).map((key) => ({
      key,
      title: audienceReports[key][0],
      basis: audienceReports[key][1],
    })),
    ...Object.entries(entityReports)
      .filter(([key]) => this.s.role !== 'Telecaller' && this.s.accessible(key))
      .map(([key, [title, dateField]]) => ({
        key,
        title,
        basis: dateField
          ? dateField + ' on the event record.'
          : 'Record creation date, grouped by current status.',
      })),
  ];
  selected = signal(this.catalog[0]?.key || '');
  filters = signal({ ...emptyFilters });
  grain = signal('monthly');
  breakdown = signal<Dimension>('status');
  page = signal(1);
  pageSize = signal(10);
  format = 'xlsx';
  error = '';
  dimensions = dimensions;
  filterKeys: Dimension[] = ['client', 'event', 'country', 'state', 'city', 'status'];
  current = computed(() => this.catalog.find((report) => report.key === this.selected())!);
  facts = computed(() => this.buildFacts(this.selected()));
  invalidRange = computed(() => {
    const { from, to } = this.filters();
    return !!(from && to && from > to);
  });
  filtered = computed(() =>
    this.invalidRange()
      ? []
      : this.facts().filter((fact) => {
          const f = this.filters();
          return (
            this.filterKeys.every((key) => !f[key] || f[key] === fact[key]) &&
            (!(f.from || f.to) ||
              (!!fact.date && (!f.from || fact.date >= f.from) && (!f.to || fact.date <= f.to))) &&
            [f.search, f.more].every((term) => fact.search.includes(term.trim().toLowerCase()))
          );
        }),
  );
  options = computed(() => {
    const f = this.filters();
    return Object.fromEntries(
      this.filterKeys.map((key) => {
        const rows = this.facts().filter(
          (row) =>
            (key !== 'event' || !f.client || row.client === f.client) &&
            (!['state', 'city'].includes(key) || !f.country || row.country === f.country) &&
            (key !== 'city' || !f.state || row.state === f.state),
        );
        return [key, [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort()];
      }),
    ) as Record<Dimension, string[]>;
  });
  groups = computed(() => aggregate(this.filtered(), this.grain(), this.breakdown()));
  chart = computed(() => aggregate(this.filtered(), this.grain()));
  distribution = computed(() => {
    const totals = new Map<string, number>();
    for (const { group, count } of this.groups())
      totals.set(group, (totals.get(group) || 0) + count);
    return [...totals.entries()]
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count || a.group.localeCompare(b.group))
      .slice(0, 8);
  });
  max = computed(() => Math.max(1, ...this.chart().map((row) => row.count)));
  pages = computed(() => Math.max(1, Math.ceil(this.groups().length / this.pageSize())));
  pageRows = computed(() =>
    this.groups().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()),
  );
  undated = computed(() => this.facts().filter((fact) => !fact.date).length);

  setFilter(key: keyof Filters, value: string) {
    this.filters.update((current) => {
      const next = { ...current, [key]: value };
      if (key === 'client') next.event = '';
      if (key === 'country') {
        next.state = '';
        next.city = '';
      }
      if (key === 'state') next.city = '';
      return next;
    });
    this.page.set(1);
  }
  clear() {
    this.filters.set({ ...emptyFilters });
    this.page.set(1);
    this.error = '';
  }
  select(key: string) {
    this.selected.set(key);
    this.clear();
  }
  download(all: boolean) {
    const rows = all ? this.groups() : this.pageRows();
    if (this.invalidRange() || !rows.length || !this.columnIndexes.length) return;
    this.error = '';
    try {
      exportTable(
        this.format,
        `${this.s.roleName} ${this.current().title} ${all ? 'all matching rows' : 'page ' + this.page()}`,
        this.columnIndexes.map((index) => this.columnHeaders[index]),
        rows.map((row) => this.columnIndexes.map((index) => this.rowValues(row)[index])),
        {
          user: this.s.auth.session?.email || 'Unrecorded',
          scope: this.scopeTitle,
          filters: { ...this.filters(), period: this.grain(), breakdown: this.breakdown() },
        },
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Export failed.';
    }
  }
  private buildFacts(key: string): ReportFact[] {
    const eventRows: any[] = this.s.scopedEvents;
    const events = new Map(eventRows.map((row) => [String(row.values[0]), row.details || {}]));
    const locations: any[] = this.s.rows.Cities || [];
    const isClient = this.s.role === 'Client Contact';
    const email = this.s.auth.session?.email;
    const clientScope = email === 'clientcontact@demo.local' ? 'Northstar Technologies' : null;
    const isExecutive = this.s.role === 'Event Executive';
    const assignedCaller = email === 'telecaller@demo.local' ? 'Neha Singh' : null;
    const fact = (
      date: unknown,
      event: string,
      client: string,
      city: string,
      status: string,
      country = '',
      state = '',
    ): ReportFact => {
      const eventDetails = events.get(event);
      const location = locations.find(
        (row) =>
          row.details?.['City name'] === city &&
          (!country || row.details.Country === country) &&
          (!state || row.details.State === state),
      )?.details;
      const result = {
        date: reportDate(date),
        event,
        client: client || eventDetails?.Client || '',
        city,
        status,
        country: country || location?.Country || '',
        state: state || location?.State || '',
      };
      return { ...result, search: Object.values(result).join(' ').toLowerCase() };
    };
    if (key in audienceReports) {
      if (!(audienceAccess[this.s.role] || []).includes(key)) return [];
      const callReport = key === 'calls' || key === 'queue';
      return this.s.regs
        .filter(
          (row) =>
            (!isClient || (!!clientScope && row.client === clientScope)) &&
            (!isExecutive || events.has(row.event)) &&
            (this.s.role !== 'Telecaller' ||
              (!!assignedCaller && row.telecaller === assignedCaller)) &&
            (callReport
              ? row.telecaller &&
                row.telecaller !== 'Unassigned' &&
                (key !== 'calls' || !!row.lastCall)
              : key === 'attendance'
                ? row.attendance === 'Checked in'
                : key === 'reconciliation'
                  ? row.registered || row.attendance === 'Checked in'
                  : row.registered),
        )
        .map((row) => {
          const attended = row.attendance === 'Checked in';
          const date = callReport
            ? row.lastCall
            : key === 'attendance'
              ? row.checkinAt
              : key === 'reconciliation'
                ? events.get(row.event)?.['Event Start Date']
                : row.registeredAt;
          const status =
            key === 'calls'
              ? row.status || 'Called'
              : key === 'queue'
                ? row.attempts > 0
                  ? 'Called'
                  : 'Pending'
                : key === 'attendance'
                  ? row.registered
                    ? 'Registered attendee'
                    : 'Walk-in'
                  : key === 'reconciliation'
                    ? row.registered
                      ? attended
                        ? 'Registered and attended'
                        : 'Registered without check-in'
                      : 'Walk-in attended'
                    : key === 'confirmations'
                      ? row.confirmation
                      : row.approval;
          return fact(
            date,
            row.event,
            row.client,
            row.city,
            status || 'Unknown',
            row.country,
            row.state,
          );
        });
    }
    if (!this.s.accessible(key) || !entityReports[key]) return [];
    const entity = this.s.m.entities[key],
      dateField = entityReports[key][1];
    return (this.s.rows[key] || [])
      .map((row: any) => {
        const column = (label: string) => String(row.values[entity.columns.indexOf(label)] || '');
        const detail = row.details || {};
        const event =
          key === 'Events' || key === 'Response'
            ? String(row.values[0])
            : String(detail.Event || column('Event') || column('Event / Type') || '');
        const client =
          key === 'Clients'
            ? column('Official name')
            : String(
                detail.Client ||
                  events.get(event)?.Client ||
                  column('Client') ||
                  column('Client / Parent') ||
                  '',
              );
        const city =
          typeof detail.City === 'string'
            ? detail.City
            : column('City') || events.get(event)?.City || '';
        return fact(
          dateField
            ? detail[dateField]
            : row.created || row.history?.find((entry: any) => entry.Action === 'Created')?.Date,
          event,
          client,
          city,
          column('Status'),
          detail.Country,
          detail.State,
        );
      })
      .filter(
        (row: ReportFact) =>
          (!isClient || (!!clientScope && row.client === clientScope)) &&
          (!isExecutive || events.has(row.event)),
      );
  }
}
