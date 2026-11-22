import { TestBed } from '@angular/core/testing';
import { ReportsPage } from './reports';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { AuthService } from '../../../../core/services/login/platform-admin-session';
import { exportHistory } from '../../../../shared/utils/platform-admin/export';

describe('Consolidated Reports', () => {
  let report: ReportsPage;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: AuthService,
          useValue: {
            session: { email: 'superadmin@demo.local', name: 'Admin', role: 'Super User' },
            users: [],
          },
        },
      ],
    });
    report = TestBed.runInInjectionContext(() => new ReportsPage());
  });
  afterEach(() => vi.restoreAllMocks());
  it('retains summary scope and columns when switching to underlying records and back', async () => {
    const fixture = TestBed.createComponent(ReportsPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    const summary = page.summary!;
    summary.filters.update((value) => ({
      ...value,
      client: 'Northstar Technologies',
      city: 'Mumbai',
    }));
    summary.columnFlags = [true, false, true];
    summary.grain.set('daily');
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.report-view-switch button')[1].click();
    await fixture.whenStable();
    fixture.nativeElement.querySelectorAll('.report-view-switch button')[0].click();
    await fixture.whenStable();
    expect(page.summary!.filters().client).toBe('Northstar Technologies');
    expect(page.summary!.filters().city).toBe('Mumbai');
    expect(page.summary!.columnFlags).toEqual([true, false, true]);
    expect(page.summary!.grain()).toBe('daily');
  });
  it('counts no-shows only for completed events and hides attendance before an event starts', () => {
    const event = report.s.rows.Events[0];
    const fact = report.s.regs[0];
    fact.event = event.values[0];
    event.details['Event Start Date'] = '2999-01-01';
    event.details['Event End Date'] = '2999-01-02';
    event.values[4] = 'Upcoming';
    expect(report.values(fact)[6]).toBe('Not started');
    expect(report.closed(fact.event)).toBe(false);
    event.details['Event Start Date'] = '2020-01-01';
    event.details['Event End Date'] = '2020-01-02';
    expect(report.closed(fact.event)).toBe(false);
    event.values[4] = 'Completed';
    expect(report.closed(fact.event)).toBe(true);
  });
  it('retains seven report choices and shows names instead of the former Restricted placeholder', () => {
    expect(report.catalog).toHaveLength(7);
    expect(report.facts.length).toBeGreaterThan(0);
    expect(report.values(report.facts[0])[1]).not.toBe('Restricted');
    report.filters.from = '2026-11-30';
    report.filters.to = '2026-11-01';
    expect(report.invalidRange).toBe(true);
    expect(report.facts).toEqual([]);
  });
  it('exports only selected columns across every matching page', () => {
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: vi.fn(), close: vi.fn() },
      print: vi.fn(),
    } as unknown as Window);
    report.format = 'pdf';
    report.size = 5;
    report.page = 2;
    report.columns = report.columns.map((_, index) => index === 1 || index === 8);
    report.download();
    expect(exportHistory()[0].columns).toEqual(['Attendee', 'Email']);
    expect(exportHistory()[0].records).toBe(report.facts.length);
    expect(report.facts.length).toBeGreaterThan(report.size);
    report.columns.fill(false);
    report.download();
    expect(exportHistory()).toHaveLength(1);
  });
  it('requires a matching client contact and creates only a local sharing preview', () => {
    report.view = 'records';
    report.share();
    expect(report.s.shares).toEqual([]);
    report.filters.client = 'Northstar Technologies';
    const contact = report.contacts[0];
    expect(contact).toBeTruthy();
    report.recipient = 'outsider@example.com';
    report.share();
    expect(report.s.shares).toHaveLength(0);
    report.recipient = contact.email;
    report.share();
    expect(report.s.shares[0]).toMatchObject({
      recipient: contact.email,
      status: 'Prepared locally - not sent',
    });
  });
});
