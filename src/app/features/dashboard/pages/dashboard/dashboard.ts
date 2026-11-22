import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import {
  PortfolioEvent,
  PortfolioFilters,
} from '../../../../shared/workspace/models/review.models';
import {
  approvalHours,
  filterPortfolio,
  waitingBands,
  RegistrationFact,
} from '../../models/portfolio-analytics';
import moduleFixtures from '../../models/module-progress.json';
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage {
  readonly s = inject(WorkspaceService);
  filters: PortfolioFilters = { client: '', event: '', city: '', from: '', to: '' };
  get today() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }
  get events(): PortfolioEvent[] {
    return this.s.scopedEvents.map((row) => {
      const details = row.details || {};
      const registrations = this.s.regs.filter(
        (r) =>
          r.event === row.values[0] &&
          r.registered &&
          (!this.filters.city || r.city === this.filters.city),
      );
      const waiting = waitingBands(registrations, Date.now());
      const start = details['Event Start Date'] || '';
      return {
        id: row.id,
        name: row.values[0],
        client: details.Client || row.values[1],
        cities: this.s.recordCities(row),
        start,
        end: details['Event End Date'] || start,
        stage: row.values[3] || details.Stage,
        status: row.values[4] || details['Event Status'],
        pax: Number(details.Pax) || 0,
        registered: registrations.length,
        approved: registrations.filter((r) => r.approval === 'Approved').length,
        pending: registrations.filter((r) => r.approval === 'Pending').length,
        agedPending: waiting[2].count,
        days: start ? Math.ceil((Date.parse(start) - Date.parse(this.today)) / 86400000) : null,
      };
    });
  }
  get modules() {
    const ids = new Set(this.filtered.map((event) => event.id));
    const totals = new Map<
      string,
      { label: string; done: number; target: number; opened: number; detail: string }
    >();
    for (const fixture of moduleFixtures.filter((row) => ids.has(row.eventId))) {
      const total = totals.get(fixture.label) || {
        label: fixture.label,
        done: 0,
        target: 0,
        opened: 0,
        detail: '',
      };
      total.done += fixture.done;
      total.target += fixture.target;
      total.opened += fixture.opened || 0;
      totals.set(fixture.label, total);
    }
    return [...totals.values()].map((total) => ({
      ...total,
      detail:
        total.label === 'Response invitations'
          ? total.done + ' delivered; ' + total.opened + ' opened; ' + total.target + ' sent'
          : total.label === 'Confirmations'
            ? total.done + ' confirmed; ' + (total.target - total.done) + ' no response'
            : 'Completed / target',
    }));
  }
  get moduleCoverage() {
    const ids = new Set(this.filtered.map((event) => event.id));
    return new Set(moduleFixtures.filter((row) => ids.has(row.eventId)).map((row) => row.eventId))
      .size;
  }
  get invalidRange() {
    return !!(this.filters.from && this.filters.to && this.filters.from > this.filters.to);
  }
  get filtered() {
    return this.invalidRange ? [] : filterPortfolio(this.events, this.filters);
  }
  get clients() {
    return [...new Set(this.events.map((event) => event.client))].sort();
  }
  get eventOptions() {
    return this.events.filter(
      (event) => !this.filters.client || event.client === this.filters.client,
    );
  }
  get cities() {
    return [...new Set(this.eventOptions.flatMap((event) => event.cities))].sort();
  }
  changeClient() {
    this.filters.event = '';
    this.filters.city = '';
  }
  get scope() {
    return this.filters.event
      ? this.filtered[0]?.name || 'No matching event'
      : 'All events: ' + this.filtered.length + ' events';
  }
  get registrations(): RegistrationFact[] {
    const names = new Set(this.filtered.map((event) => event.name));
    return this.s.regs.filter(
      (row) =>
        names.has(row.event) &&
        row.registered &&
        (!this.filters.city || row.city === this.filters.city),
    );
  }
  get pax() {
    return this.filtered.reduce((sum, event) => sum + event.pax, 0);
  }
  get waiting() {
    return waitingBands(this.registrations, Date.now());
  }
  get average() {
    const value = approvalHours(this.registrations);
    return value === null ? 'No timed approvals' : value.toFixed(1) + ' hours';
  }
  get cards() {
    return [
      [
        'Active events today',
        this.filtered.filter(
          (event) =>
            event.start &&
            event.start <= this.today &&
            event.end >= this.today &&
            !['Completed', 'Cancelled'].includes(event.status),
        ).length,
      ],
      [
        'Starting within 30 days',
        this.filtered.filter(
          (event) =>
            event.days !== null &&
            event.days >= 0 &&
            event.days <= 30 &&
            !['Completed', 'Cancelled'].includes(event.status),
        ).length,
      ],
      [
        'Registered / Pax',
        this.registrations.length +
          ' / ' +
          this.pax +
          ' (' +
          (this.pax ? Math.round((this.registrations.length / this.pax) * 100) : 0) +
          '%)',
      ],
      [
        'Pending approvals',
        this.waiting.reduce((sum, band) => sum + band.count, 0) +
          ' (' +
          this.waiting[2].count +
          ' waiting 3+ days)',
      ],
      ['Average approval time', this.average],
    ];
  }
  get nextEvents() {
    return this.filtered
      .filter(
        (event) =>
          event.start && event.end >= this.today && ['Upcoming', 'Ongoing'].includes(event.status),
      )
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 10);
  }
  get attention() {
    return this.filtered.filter((event) => event.agedPending > 0);
  }
  readonly statuses = ['Upcoming', 'Ongoing', 'On Hold', 'Completed'];
  get stages() {
    return [...new Set(this.filtered.map((event) => event.stage))].map((stage) => ({
      stage,
      total: this.filtered.filter((event) => event.stage === stage).length,
      segments: this.statuses.map((status) => ({
        status,
        count: this.filtered.filter((event) => event.stage === stage && event.status === status)
          .length,
      })),
    }));
  }
  get eventBars() {
    return this.nextEvents;
  }
  get daily() {
    const days = new Map<
      string,
      { day: string; approved: number; declined: number; pending: number; count: number }
    >();
    for (const row of this.registrations) {
      const day = row.registeredAt
        ? new Date(row.registeredAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
        : 'Undated';
      const item = days.get(day) || { day, approved: 0, declined: 0, pending: 0, count: 0 };
      item.count++;
      if (row.approval === 'Approved') item.approved++;
      else if (['Declined', 'Rejected'].includes(row.approval)) item.declined++;
      else if (row.approval === 'Pending') item.pending++;
      days.set(day, item);
    }
    return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
  }
  get dailyMax() {
    return Math.max(1, ...this.daily.map((day) => day.count));
  }
  get trend() {
    let count = 0;
    return this.daily
      .filter((day) => day.day !== 'Undated')
      .map((day) => ({ ...day, cumulative: (count += day.count) }));
  }
  get trendScale() {
    return Math.max(1, this.pax, this.registrations.length);
  }
  get trendPoints() {
    return this.trend
      .map(
        (point, index) =>
          20 +
          (index * 560) / Math.max(1, this.trend.length - 1) +
          ',' +
          (150 - (point.cumulative * 130) / this.trendScale),
      )
      .join(' ');
  }
  barMaximum(event: PortfolioEvent) {
    return Math.max(1, event.pax, event.registered, event.approved);
  }
  get statusGradient() {
    const total = this.registrations.length;
    if (!total) return 'var(--line)';
    const a = (this.outcomes[0].count * 100) / total,
      b = a + (this.outcomes[1].count * 100) / total,
      c = b + (this.outcomes[2].count * 100) / total;
    return (
      'conic-gradient(#2e8b66 0% ' +
      a +
      '%,#bd4653 ' +
      a +
      '% ' +
      b +
      '%,#e4a52f ' +
      b +
      '% ' +
      c +
      '%,var(--line) ' +
      c +
      '% 100%)'
    );
  }
  get outcomes() {
    return [
      {
        name: 'Approved',
        count: this.registrations.filter((row) => row.approval === 'Approved').length,
      },
      {
        name: 'Declined',
        count: this.registrations.filter((row) => ['Declined', 'Rejected'].includes(row.approval))
          .length,
      },
      {
        name: 'Pending',
        count: this.registrations.filter((row) => row.approval === 'Pending').length,
      },
    ];
  }
  open(event: PortfolioEvent) {
    const row = this.s.scopedEvents.find((row) => row.id === event.id);
    if (!row) return;
    this.s.nav('Events');
    this.s.event = row.values[0];
    this.s.viewRecord(row);
  }
  openSelected() {
    const event = this.filtered.find((event) => event.id === this.filters.event);
    if (event) this.open(event);
  }
  viewAll() {
    this.s.eventClientFilter = this.filters.client;
    this.s.nav('Events');
  }
}
