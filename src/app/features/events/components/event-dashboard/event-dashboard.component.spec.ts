import { TestBed } from '@angular/core/testing';
import { EventDashboardComponent } from './event-dashboard.component';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { AuthService } from '../../../../core/services/login/platform-admin-session';

describe('Approved event-detail capabilities', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [EventDashboardComponent],
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
  });
  afterEach(() => vi.restoreAllMocks());
  it('offers event creation to Admin in the empty event view', () => {
    const state = TestBed.inject(WorkspaceService);
    state.rows.Events = [];
    const fixture = TestBed.createComponent(EventDashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No events match this view.');
    expect(fixture.nativeElement.textContent).toContain('Add New Event');
  });
  it('allows requirements entries while retaining staff and scheduling restrictions', async () => {
    const state = TestBed.inject(WorkspaceService);
    state.nav('Events');
    state.viewRecord(state.rows.Events[0]);
    const fixture = TestBed.createComponent(EventDashboardComponent);
    fixture.componentRef.setInput('detail', true);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.canWriteLog).toBe(true);
    expect(page.canManageExecutives).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Add log entry');
    expect(fixture.nativeElement.textContent).not.toContain('Save schedule');
    page.remarks = 'Approved requirement';
    await page.append({ value: '' } as HTMLInputElement);
    fixture.detectChanges();
    expect(page.state.log[0].remarks).toBe('Approved requirement');
    expect(fixture.nativeElement.textContent).toContain('Approved requirement');
  });
  it('keeps failed log writes out of the saved event history', async () => {
    const state = TestBed.inject(WorkspaceService);
    state.nav('Events');
    state.viewRecord(state.rows.Events[0]);
    const fixture = TestBed.createComponent(EventDashboardComponent);
    fixture.componentRef.setInput('detail', true);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    page.remarks = 'Not persisted';
    await page.append({ value: '' } as HTMLInputElement);
    expect(page.state.log).toEqual([]);
    expect(page.busy).toBe(false);
    expect(page.error).toContain('storage');
  });
});
