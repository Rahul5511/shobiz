import { TestBed } from '@angular/core/testing';
import {
  filterPortfolio,
  approvalHours,
  waitingBands,
  RegistrationFact,
} from './portfolio-analytics';
import { PortfolioEvent } from '../../../shared/workspace/models/review.models';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { WorkspaceService } from '../../../shared/workspace/data-access/workspace.service';
import { AuthService } from '../../../core/services/login/platform-admin-session';

describe('Portfolio review analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-22T08:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());
  const fact = (approval: string, registeredAt?: string, decidedAt?: string): RegistrationFact => ({
    event: 'Forum',
    registered: true,
    city: 'Mumbai',
    approval,
    registeredAt,
    decidedAt,
  });
  it('places approvals in the correct 24/72-hour bands and keeps unknown times separate', () => {
    const now = Date.now();
    const at = (hours: number) => new Date(now - hours * 3600000).toISOString();
    const bands = waitingBands(
      [
        fact('Pending', at(23)),
        fact('Pending', at(24)),
        fact('Pending', at(72)),
        fact('Pending'),
        fact('Pending', at(-1)),
        fact('Approved', at(100)),
      ],
      now,
    );
    expect(bands.map((band) => band.count)).toEqual([1, 1, 1, 2]);
  });
  it('excludes negative/missing approval durations from averages', () => {
    expect(
      approvalHours([
        fact('Approved', '2026-11-20T01:00Z', '2026-11-20T03:00Z'),
        fact('Approved', '2026-11-20T01:00Z', '2026-11-20T05:00Z'),
        fact('Approved', '2026-11-20T05:00Z', '2026-11-20T01:00Z'),
        fact('Approved'),
        fact('Pending'),
      ]),
    ).toBe(3);
    expect(approvalHours([fact('Pending')])).toBeNull();
  });
  it('combines client, event, city and date filters without changing source records', () => {
    const event: PortfolioEvent = {
      id: 'one',
      name: 'Forum',
      client: 'Client',
      cities: ['Mumbai', 'Pune'],
      start: '2026-11-25',
      end: '2026-11-25',
      stage: 'Planning',
      status: 'Upcoming',
      pax: 100,
      registered: 2,
      approved: 1,
      pending: 1,
      agedPending: 0,
      days: 3,
    };
    const filters = {
      client: 'Client',
      event: 'one',
      city: 'Pune',
      from: '2026-11-24',
      to: '2026-11-26',
    };
    expect(filterPortfolio([event], filters)).toEqual([event]);
    expect(filterPortfolio([event], { ...filters, city: 'Delhi' })).toEqual([]);
    expect(filterPortfolio([event], { ...filters, from: '2026-11-30', to: '2026-11-01' })).toEqual(
      [],
    );
    expect(event.cities).toHaveLength(2);
  });
  it('defaults to all events, caps the next-event table and drills into the selected record', () => {
    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: AuthService,
          useValue: {
            session: { name: 'Admin', email: 'superadmin@demo.local', role: 'Super User' },
            users: [],
          },
        },
      ],
    });
    const dashboard = TestBed.runInInjectionContext(() => new DashboardPage());
    expect(dashboard.filters.event).toBe('');
    expect(dashboard.filtered.length).toBe(dashboard.s.rows.Events.length);
    expect(dashboard.nextEvents.length).toBeGreaterThan(0);
    expect(
      dashboard.nextEvents.every((event) => ['Upcoming', 'Ongoing'].includes(event.status)),
    ).toBe(true);
    expect(dashboard.moduleCoverage).toBeGreaterThan(0);
    const event = dashboard.nextEvents[0];
    dashboard.open(event);
    expect(dashboard.s.key).toBe('Events');
    expect(dashboard.s.view).toBe('detail');
    expect(dashboard.s.selected.id).toBe(event.id);
    dashboard.filters.client = 'no such client';
    expect(dashboard.filtered).toEqual([]);
    expect(dashboard.modules).toEqual([]);
  });
});
