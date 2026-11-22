import {
  ViewEncapsulation,
  Component,
  inject,
  Input,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { exportTable } from '../../../../shared/utils/platform-admin/export';

type LogEntry = {
  author: string;
  at: string;
  city: string;
  remarks: string;
  files: { name: string; data: string }[];
};
type Executive = { name: string; email: string };
type Schedule = { frequency: string; time: string; format: string };
type EventData = { log: LogEntry[]; executives: Executive[]; schedule?: Schedule };

@Component({
  selector: 'app-event-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-dashboard.component.html',
  // Preserve the existing CSS selectors and native admin scope.
  encapsulation: ViewEncapsulation.None,
  styleUrl: './event-dashboard.component.css',
})
export class EventDashboardComponent {
  @Input() detail = false;
  s = inject(WorkspaceService);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('requirementsRemarks') requirementsRemarks?: ElementRef<HTMLTextAreaElement>;
  ngAfterViewInit() {
    if (this.detail && this.s.requirementsFocus) {
      this.s.requirementsFocus = false;
      this.requirementsRemarks?.nativeElement.focus();
    }
  }
  city = '';
  from = '';
  to = '';
  name = '';
  email = '';
  remarks = '';
  logCity = '';
  files: File[] = [];
  busy = false;
  error = '';
  frequency = 'Daily';
  time = '09:00';
  format = 'xlsx';
  storage: Record<string, EventData> = this.read();

  private read() {
    try {
      return JSON.parse(localStorage.getItem('ngage-event-dashboard') || '{}');
    } catch {
      return {};
    }
  }
  get eventRow() {
    return this.detail
      ? this.s.selected
      : this.portfolio.find((row) => row.values[0] === this.s.event);
  }
  get details() {
    return this.eventRow?.details || {};
  }
  get eventName() {
    return this.eventRow?.values[0] || '';
  }
  get events() {
    return this.s.scopedEvents;
  }
  ngOnInit() {
    if (this.detail) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const active = this.events.find(
      (row) =>
        row.details?.['Event Start Date'] <= today && row.details?.['Event End Date'] >= today,
    );
    const upcoming = this.events
      .filter((row) => row.details?.['Event Start Date'] > today)
      .sort((a, b) => a.details['Event Start Date'].localeCompare(b.details['Event Start Date']));
    this.s.event =
      (
        active ||
        upcoming[0] ||
        this.events.find((row) => row.values[0] === this.s.event) ||
        this.events[0]
      )?.values[0] || '';
  }
  get state(): EventData {
    return (
      this.storage[this.eventRow?.id] || {
        log: [],
        executives: (this.details['Event Executives'] || []).map((name: string) => ({
          name,
          email: '',
        })),
      }
    );
  }
  get canReadLog() {
    return (
      this.s.role !== 'Client Contact' && !!this.eventRow && this.events.includes(this.eventRow)
    );
  }
  get canWriteLog() {
    return (
      this.canReadLog &&
      [
        'Super User',
        'Account Manager',
        'Client Servicing Manager',
        'AG Manager',
        'AG Head',
        'Event Executive',
      ].includes(this.s.role)
    );
  }
  get canManageExecutives() {
    return this.s.role !== 'Super User' && this.s.eventEditor && !!this.eventRow;
  }
  get daysToEvent() {
    const start = this.details['Event Start Date'];
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    return start ? Math.ceil((Date.parse(start) - Date.parse(today)) / 86400000) : null;
  }
  get calling() {
    return this.s.role === 'Telecaller';
  }
  get cities(): string[] {
    return [
      ...new Set<string>(
        [
          this.details.City,
          this.details.Cities,
          ...this.s.regs.filter((row) => row.event === this.eventName).map((row) => row.city),
        ]
          .flat()
          .filter(Boolean),
      ),
    ].sort();
  }
  get portfolio() {
    return this.events.filter(
      (row) =>
        (!this.from || row.details?.['Event Start Date'] >= this.from) &&
        (!this.to || row.details?.['Event Start Date'] <= this.to),
    );
  }
  get registrations() {
    return this.s.regs.filter(
      (row) =>
        row.event === this.eventName &&
        row.registered &&
        (!this.city || row.city === this.city) &&
        (!(this.from || this.to) ||
          (!!row.registeredAt &&
            (!this.from || row.registeredAt.slice(0, 10) >= this.from) &&
            (!this.to || row.registeredAt.slice(0, 10) <= this.to))),
    );
  }
  get approvalAllowed() {
    return !this.calling && !['DB Head', 'DB Manager'].includes(this.s.role);
  }
  get counts() {
    const rows = this.registrations;
    return [
      ['Registered contacts', rows.length],
      ['Registered accounts', new Set(rows.map((r) => r.company).filter(Boolean)).size],
      ['Pax target', Number(this.details.Pax) || 0],
      ['Approved', rows.filter((r) => r.approval === 'Approved').length],
      ['Pending approval', this.pending.length],
      ['Declined', rows.filter((r) => ['Declined', 'Rejected'].includes(r.approval)).length],
      ['Confirmed', rows.filter((r) => r.confirmation === 'Confirmed').length],
      ...(String(this.details['Event Start Date'] || '') <=
      new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
        ? [['Registered and attended', rows.filter((r) => r.attendance === 'Checked in').length]]
        : []),
    ];
  }
  get pending() {
    return this.registrations.filter((row) => row.approval === 'Pending');
  }
  private hours(start: string, end: number) {
    return start ? (end - Date.parse(start)) / 3600000 : NaN;
  }
  get waiting() {
    const bins = [
      { label: 'Under 24 hours', count: 0 },
      { label: '1–2 days', count: 0 },
      { label: '3+ days', count: 0 },
      { label: 'Unknown', count: 0 },
    ];
    for (const row of this.pending) {
      const hours = this.hours(row.registeredAt, Date.now());
      bins[!Number.isFinite(hours) || hours < 0 ? 3 : hours < 24 ? 0 : hours < 72 ? 1 : 2].count++;
    }
    return bins;
  }
  get average() {
    const hours = this.registrations
      .filter((row) => row.approval === 'Approved')
      .map((row) => this.hours(row.registeredAt, Date.parse(row.decidedAt)))
      .filter((h) => Number.isFinite(h) && h >= 0);
    return hours.length
      ? (hours.reduce((sum, h) => sum + h, 0) / hours.length).toFixed(1) + ' hours'
      : 'No timed approvals';
  }
  get daily() {
    const days = new Map<
      string,
      { day: string; approved: number; declined: number; pending: number }
    >();
    for (const row of this.registrations) {
      const outcome = row.approval === 'Rejected' ? 'declined' : String(row.approval).toLowerCase();
      if (outcome !== 'approved' && outcome !== 'declined' && outcome !== 'pending') continue;
      const day = row.registeredAt?.slice(0, 10) || 'Undated';
      const counts = days.get(day) || { day, approved: 0, declined: 0, pending: 0 };
      counts[outcome]++;
      days.set(day, counts);
    }
    return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
  }
  get dailyMax() {
    return Math.max(1, ...this.daily.map((r) => r.approved + r.declined + r.pending));
  }
  get approvers() {
    const counts = new Map<string, number>();
    for (const row of this.registrations.filter((row) => row.approval === 'Approved')) {
      const name = row.clientApprover || 'Unrecorded';
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...counts.entries()];
  }
  get workSections() {
    const sections = [
      {
        name: 'Database',
        flag: 'DB Required',
        keys: ['DRF', 'Extraction', 'Sample', 'Lots', 'Returns'],
      },
      {
        name: 'Response',
        flag: 'Response Required',
        keys: ['Release', 'Broadcast', 'CallingAssign', 'Updates'],
      },
    ];
    return sections
      .filter((section) => this.details[section.flag] === 'Yes')
      .map((section) => ({
        ...section,
        items: section.keys
          .filter((key) => this.s.accessible(key))
          .map((key) => {
            const entity = this.s.m.entities[key];
            return {
              key,
              label: entity.label,
              count: this.s.rows[key].filter((row: any) => {
                const event = row.details?.Event || row.values[entity.columns.indexOf('Event')];
                const city = row.details?.City || row.values[entity.columns.indexOf('City')];
                const date = String(row.created || '').slice(0, 10);
                return (
                  event === this.eventName &&
                  (!this.city || city === this.city) &&
                  (!this.from || date >= this.from) &&
                  (!this.to || date <= this.to)
                );
              }).length,
            };
          }),
      }))
      .filter((section) => section.items.length);
  }
  selectEvent(name: string) {
    this.s.event = name;
    this.city = '';
    this.error = '';
  }
  chooseEvent(row: any) {
    this.s.nav('Events');
    this.s.event = row.values[0];
    this.s.viewRecord(row);
  }
  private save(id: string, data: EventData) {
    try {
      const next = { ...this.read(), [id]: data };
      localStorage.setItem('ngage-event-dashboard', JSON.stringify(next));
      this.storage = next;
      this.error = '';
      return true;
    } catch {
      this.error = 'Browser storage is full. Try a smaller attachment.';
      return false;
    }
  }
  addExecutive() {
    if (!this.canManageExecutives) return;
    const email = this.email.trim().toLowerCase(),
      name = this.name.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error = 'Enter a name and valid email.';
      return;
    }
    if (this.state.executives.some((row) => row.email === email)) {
      this.error = 'This email already has access to this event.';
      return;
    }
    const existing = this.s.auth.users.find((user) => user.email === email);
    if (existing && !existing.roles.includes('Event Executive')) {
      this.error = 'This email belongs to a different role in the demo.';
      return;
    }
    if (
      !this.save(this.eventRow.id, {
        ...this.state,
        executives: [...this.state.executives, { name, email }],
      })
    )
      return;
    if (!existing) this.s.auth.upsertDemoUser(email, name, ['Event Executive'], 'Password');
    this.name = '';
    this.email = '';
  }
  removeExecutive(index: number) {
    if (this.canManageExecutives)
      this.save(this.eventRow.id, {
        ...this.state,
        executives: this.state.executives.filter((_, i) => i !== index),
      });
  }
  setFiles(event: Event) {
    this.files = Array.from((event.target as HTMLInputElement).files || []);
  }
  async append(fileInput: HTMLInputElement) {
    if (!this.canWriteLog || this.busy) return;
    const id = this.eventRow.id,
      remarks = this.remarks.trim(),
      city = this.logCity;
    if (!remarks && !this.files.length) {
      this.error = 'Enter a remark or attach a file.';
      return;
    }
    if (this.files.reduce((size, file) => size + file.size, 0) > 1024 * 1024) {
      this.error = 'Attachments must total 1 MB or less per entry.';
      return;
    }
    this.busy = true;
    try {
      const files = await Promise.all(
        this.files.map(
          (file) =>
            new Promise<{ name: string; data: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: file.name, data: String(reader.result) });
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );
      const state = this.read()[id] || this.state;
      if (
        this.save(id, {
          ...state,
          log: [
            ...state.log,
            {
              remarks,
              city,
              files,
              author: this.s.auth.session?.name,
              at: new Date().toISOString(),
            },
          ],
        })
      ) {
        this.remarks = '';
        this.logCity = '';
        this.files = [];
        fileInput.value = '';
      }
    } catch {
      this.error = 'Could not read the attachment.';
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }
  download(file: { name: string; data: string }) {
    if (!this.canReadLog) return;
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
  }
  schedule() {
    if (this.s.role === 'Super User' || !this.s.eventEditor || !this.time || !this.eventRow) return;
    this.save(this.eventRow.id, {
      ...this.state,
      schedule: { frequency: this.frequency, time: this.time, format: this.format },
    });
  }
  preview() {
    if (this.s.role === 'Super User' || !this.s.eventEditor || !this.eventRow) return;
    try {
      exportTable(
        this.state.schedule?.format || this.format,
        this.eventName + ' registration report',
        ['Metric', 'Count'],
        this.counts,
        this.s.exportContext,
      );
    } catch (error) {
      this.error = String(error);
    }
  }
}
