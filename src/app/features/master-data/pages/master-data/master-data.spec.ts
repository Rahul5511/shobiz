import { TestBed } from '@angular/core/testing';
import { MasterDataPage } from './master-data';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { WORKSPACE_UI_ACTIONS } from '../../../../shared/workspace/models/workspace-ui-actions';
import { AuthService } from '../../../../core/services/login/platform-admin-session';

describe('Master Data entry focus', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        { provide: WORKSPACE_UI_ACTIONS, useValue: { showQr: vi.fn(), upload: vi.fn() } },
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
  it('focuses and highlights the selector on opening and reopening while retaining all masters', async () => {
    const s = TestBed.inject(WorkspaceService);
    s.openMaster();
    const fixture = TestBed.createComponent(MasterDataPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(document.activeElement).toBe(select);
    expect(fixture.nativeElement.querySelector('.master-selector').textContent).toContain(
      'Manage Master Data (Add/Edit)',
    );
    expect(select.options).toHaveLength(11);
    select.value = 'Cities';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(s.key).toBe('Cities');
    expect(fixture.nativeElement.querySelector('app-cities-page')).toBeTruthy();
    select.blur();
    s.openMaster();
    await fixture.whenStable();
    expect(document.activeElement).toBe(select);
    expect(s.key).toBe('Cities');
  });
});
