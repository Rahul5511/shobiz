import { TestBed } from '@angular/core/testing';
import { RolePermissionsPage } from './role-permissions';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { AuthService } from '../../../../core/services/login/platform-admin-session';
const auth = {
  session: { email: 'superadmin@demo.local', name: 'Admin', role: 'Super User' },
  users: [],
};
describe('Roles & Permissions UI', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<RolePermissionsPage>>;
  let page: RolePermissionsPage;
  let show: PropertyDescriptor | undefined;
  let close: PropertyDescriptor | undefined;
  beforeEach(async () => {
    localStorage.clear();
    auth.session.role = 'Super User';
    show = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
    close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    });
    TestBed.configureTestingModule({
      imports: [RolePermissionsPage],
      providers: [WorkspaceService, { provide: AuthService, useValue: auth }],
    });
    fixture = TestBed.createComponent(RolePermissionsPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });
  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
    if (show) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', show);
    else delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)['showModal'];
    if (close) Object.defineProperty(HTMLDialogElement.prototype, 'close', close);
    else delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)['close'];
  });
  const button = (root: HTMLElement, text: string) =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.replace(/\s+/g, ' ').trim() === text,
    )!;
  function amCell() {
    return fixture.nativeElement.querySelector(
      'button[data-permission-cell][data-role="shobiz-am"]',
    ) as HTMLButtonElement;
  }

  it('edits directly in a single cell popover, closes after selection and returns focus', async () => {
    const cell = amCell();
    cell.click();
    await fixture.whenStable();
    expect(page.cell()?.feature.id).toBe('clients');
    expect(fixture.nativeElement.querySelectorAll('ngage-popover')).toHaveLength(1);
    const popover = fixture.nativeElement.querySelector('ngage-popover') as HTMLElement;
    expect(popover.textContent).toContain('Account Manager');
    popover.querySelector<HTMLButtonElement>('button[aria-label="View"]')!.click();
    await fixture.whenStable();
    expect(page.store.changes()).toHaveLength(1);
    expect(page.cell()).toBeNull();
    expect(amCell().getAttribute('data-level')).toBe('V');
    expect(amCell().classList.contains('modified')).toBe(true);
    expect(document.activeElement).toBe(amCell());
  });
  it('shares unsaved values between matrix and role-wise views', async () => {
    expect(button(fixture.nativeElement, 'Role-wise View')).toBeUndefined();
    amCell().click();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('ngage-popover button[aria-label="View"]').click();
    await fixture.whenStable();
    // The switch is temporarily hidden; keep verifying the retained view implementation.
    page.setMode('role');
    await fixture.whenStable();
    const row = fixture.nativeElement.querySelector('.role-feature') as HTMLElement;
    expect(row.querySelector('button[aria-pressed="true"]')!.textContent?.trim()).toBe('V');
    row.querySelector<HTMLButtonElement>('button[aria-label="None"]')!.click();
    await fixture.whenStable();
    page.setMode('matrix');
    await fixture.whenStable();
    expect(amCell().getAttribute('data-level')).toBe('N');
    expect(page.store.changes()).toHaveLength(1);
  });
  it('keeps drafts through filters and lets an outside input retain focus when dismissing the popover', async () => {
    amCell().click();
    await fixture.whenStable();
    const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    search.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    search.focus();
    await fixture.whenStable();
    expect(page.cell()).toBeNull();
    expect(document.activeElement).toBe(search);
    page.store.setPermission(page.store.roles()[1], page.store.features()[0], 'V');
    search.value = 'No matching permission';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No matching permissions');
    expect(page.store.changes()).toHaveLength(1);
    button(fixture.nativeElement, 'Clear Filters').click();
    await fixture.whenStable();
    expect(amCell().getAttribute('data-level')).toBe('V');
  });
  it('allows Platform Admin editing and only offers valid options for Reports and Client Contact', async () => {
    const adminCell = fixture.nativeElement.querySelector('button[data-role="shobiz-pa"]');
    expect(adminCell).toBeTruthy();
    expect(fixture.nativeElement.querySelector('th.admin-column ngage-icon')).toBeNull();
    adminCell.click();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('ngage-popover button[aria-label="None"]').click();
    await fixture.whenStable();
    expect(adminCell.getAttribute('data-level')).toBe('N');
    const cells = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        'button[data-role="shobiz-cc"]',
      ),
    );
    cells[0].click();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('ngage-popover button[aria-label="Manage"]'),
    ).toBeNull();
    page.closePopover();
    await fixture.whenStable();
    const reports = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        'button[data-role="shobiz-am"]',
      ),
    ).find((cell) => cell.getAttribute('aria-label')?.includes('Reports and downloads'))!;
    reports.click();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('ngage-popover button[aria-label="None"]'),
    ).toBeNull();
  });
  it('reviews all changes, including hidden roles, and saves once only after confirmation', async () => {
    const workspace = TestBed.inject(WorkspaceService);
    const persist = vi.spyOn(workspace, 'persist');
    page.store.setPermission(page.store.roles()[1], page.store.features()[0], 'V');
    page.store.setPermission(
      page.store.roles().find((role) => role.id === 'shobiz-rm')!,
      page.store.features().find((feature) => feature.id === 'broadcasts')!,
      'N',
    );
    page.store.roleIds.set(['shobiz-tc']);
    page.store.setChangedOnly(true);
    await fixture.whenStable();
    button(fixture.nativeElement, 'Save Changes').click();
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector(
      'dialog[aria-label="Review permission changes"]',
    ) as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(dialog.textContent).toContain('Reduced');
    expect(dialog.textContent).toContain('Removed');
    expect(persist).not.toHaveBeenCalled();
    button(dialog, 'Continue Editing').click();
    await fixture.whenStable();
    expect(page.store.changes()).toHaveLength(2);
    expect(persist).not.toHaveBeenCalled();
    button(fixture.nativeElement, 'Save Changes').click();
    await fixture.whenStable();
    button(dialog, 'Confirm & Save').click();
    await fixture.whenStable();
    expect(persist).toHaveBeenCalledTimes(1);
    expect(page.store.changes()).toHaveLength(0);
    expect(dialog.open).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Permissions saved successfully.');
  });
  it('discards only after confirmation and restores the original values', async () => {
    page.store.setPermission(page.store.roles()[1], page.store.features()[0], 'V');
    await fixture.whenStable();
    button(fixture.nativeElement, 'Discard Changes').click();
    await fixture.whenStable();
    expect(page.store.changes()).toHaveLength(1);
    const dialog = fixture.nativeElement.querySelector(
      'dialog[aria-label="Discard permission changes?"]',
    ) as HTMLDialogElement;
    button(dialog, 'Continue Editing').click();
    await fixture.whenStable();
    expect(page.store.changes()).toHaveLength(1);
    button(fixture.nativeElement, 'Discard Changes').click();
    await fixture.whenStable();
    button(dialog, 'Discard Changes').click();
    await fixture.whenStable();
    expect(page.store.changes()).toHaveLength(0);
    expect(amCell().getAttribute('data-level')).toBe('M');
    expect(button(fixture.nativeElement, 'Save Changes').disabled).toBe(true);
  });
  it('switches the selected cell without opening another popover or saving anything', async () => {
    const cells = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      'button[data-role="shobiz-am"]',
    );
    cells[0].click();
    await fixture.whenStable();
    cells[1].click();
    await fixture.whenStable();
    expect(page.cell()?.feature.id).toBe('event-details');
    expect(fixture.nativeElement.querySelectorAll('ngage-popover')).toHaveLength(1);
    expect(page.store.changes()).toHaveLength(0);
  });
  it('shows failed-save feedback inside the review dialog and keeps changes retryable', async () => {
    page.store.setPermission(page.store.roles()[1], page.store.features()[0], 'V');
    await fixture.whenStable();
    button(fixture.nativeElement, 'Save Changes').click();
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector(
      'dialog[aria-label="Review permission changes"]',
    ) as HTMLDialogElement;
    const failure = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    button(dialog, 'Confirm & Save').click();
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('ngage-alert')!.textContent).toContain('storage');
    expect(page.store.changes()).toHaveLength(1);
    failure.mockRestore();
    button(dialog, 'Confirm & Save').click();
    await fixture.whenStable();
    expect(page.store.changes()).toHaveLength(0);
    expect(dialog.open).toBe(false);
  });

  it('filters several roles through the checkbox popover without losing edits to hidden roles', async () => {
    page.store.setPermission(page.store.roles()[1], page.store.features()[0], 'V');
    await fixture.whenStable();
    button(fixture.nativeElement, 'All roles').click();
    await fixture.whenStable();
    const options = fixture.nativeElement.querySelectorAll(
      '.role-filter-options input',
    ) as NodeListOf<HTMLInputElement>;
    options[1].click();
    options[2].click();
    await fixture.whenStable();
    expect(page.store.visibleRoles()).toHaveLength(page.store.roles().length - 2);
    expect(page.store.changes()).toHaveLength(1);
    expect(page.store.visibleRoles().some((role) => role.id === 'shobiz-am')).toBe(false);
    button(fixture.nativeElement.querySelector('ngage-popover'), 'Select all').click();
    await fixture.whenStable();
    expect(page.store.visibleRoles()).toHaveLength(page.store.roles().length);
    expect(amCell().getAttribute('data-level')).toBe('V');
  });
});
