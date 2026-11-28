import { TestBed } from '@angular/core/testing';
import { WorkspaceService } from '../../../shared/workspace/data-access/workspace.service';
import { AuthService } from '../../../core/services/login/platform-admin-session';
import { PermissionRepository } from '../data-access/permission.repository';
import { RolePermissionsStore } from './role-permissions.store';
const auth = {
  session: { email: 'superadmin@demo.local', name: 'Admin', role: 'Super User' },
  users: [],
};
describe('Permission draft and batch saving', () => {
  let store: RolePermissionsStore;
  let workspace: WorkspaceService;
  beforeEach(async () => {
    localStorage.clear();
    auth.session.role = 'Super User';
    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        PermissionRepository,
        RolePermissionsStore,
        { provide: AuthService, useValue: auth },
      ],
    });
    workspace = TestBed.inject(WorkspaceService);
    store = TestBed.inject(RolePermissionsStore);
    await store.load();
  });
  afterEach(() => vi.restoreAllMocks());
  const edit = (store: RolePermissionsStore) =>
    store.setPermission(
      store.roles().find((role) => role.id === 'shobiz-am')!,
      store.features().find((feature) => feature.id === 'clients')!,
      'V',
    );
  it('tracks one change per cell, writes nothing per selection and clears a reverted modification', () => {
    const persist = vi.spyOn(workspace, 'persist');
    edit(store);
    expect(store.changes()).toHaveLength(1);
    expect(store.groups()[0].modified).toBe(1);
    expect(persist).not.toHaveBeenCalled();
    store.setPermission(store.roles()[1], store.features()[0], 'M');
    expect(store.changes()).toEqual([]);
    expect(store.groups()[0].modified).toBe(0);
  });
  it('preserves edits across modes, selection, filters, search and collapse actions', () => {
    edit(store);
    const values = JSON.stringify(store.values());
    store.mode.set('role');
    store.selectedRoleId.set('shobiz-rm');
    store.setSearch('wishlist');
    store.setModule('Database');
    store.roleIds.set(['shobiz-tc']);
    store.collapseAll();
    store.setChangedOnly(true);
    expect(store.groups()).toEqual([]);
    expect(store.changes()).toHaveLength(1);
    store.clearFilters();
    store.mode.set('matrix');
    expect(JSON.stringify(store.values())).toBe(values);
  });
  it('expands matching groups on search and keeps full module feature counts', () => {
    store.collapseAll();
    store.setSearch('wishlist');
    expect(store.groups()).toHaveLength(1);
    expect(store.groups()[0].name).toBe('Database');
    expect(store.groups()[0].features).toHaveLength(1);
    expect(store.groups()[0].total).toBe(7);
    expect(store.collapsed().has('Database')).toBe(false);
  });
  it('rejects protected or invalid batches before any write', () => {
    const persist = vi.spyOn(workspace, 'persist');
    const before = JSON.stringify(workspace.featurePermissionValues);
    const result = workspace.saveFeaturePermissions([
      { roleId: 'shobiz-am', featureId: 'clients', previous: 'M', next: 'V' },
      { roleId: 'shobiz-cc', featureId: 'clients', previous: 'N', next: 'M' },
    ]);
    expect(result.success).toBe(false);
    expect(JSON.stringify(workspace.featurePermissionValues)).toBe(before);
    expect(persist).not.toHaveBeenCalled();
    store.setPermission(
      store.roles().find((role) => role.id === 'shobiz-cc')!,
      store.features()[0],
      'M',
    );
    expect(store.changes()).toHaveLength(0);
  });
  it('saves and reloads Platform Admin permission edits like other roles', async () => {
    store.setPermission(store.roles()[0], store.features()[0], 'N');
    expect(store.changes()).toHaveLength(1);
    expect(await store.save()).toBe(true);
    await store.load();
    expect(store.values()['shobiz-pa']['clients']).toBe('N');
  });
  it('commits the whole batch once and restores the saved values after reloading', async () => {
    edit(store);
    store.setPermission(
      store.roles().find((role) => role.id === 'shobiz-rm')!,
      store.features().find((feature) => feature.id === 'broadcasts')!,
      'V',
    );
    const persist = vi.spyOn(workspace, 'persist');
    expect(await store.save()).toBe(true);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(store.changes()).toHaveLength(0);
    expect(store.status()).toBe('saved');
    const restored = TestBed.runInInjectionContext(() => new RolePermissionsStore());
    await restored.load();
    expect(restored.level('shobiz-am', 'clients')).toBe('V');
    expect(restored.level('shobiz-rm', 'broadcasts')).toBe('V');
  });
  it('preserves pending edits and the committed state when storage fails', async () => {
    workspace.persist();
    const raw = localStorage.getItem('ngage-demo-data');
    edit(store);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(await store.save()).toBe(false);
    expect(store.changes()).toHaveLength(1);
    expect(store.original()['shobiz-am']['clients']).toBe('M');
    expect(workspace.featurePermissionValues).toEqual({});
    expect(localStorage.getItem('ngage-demo-data')).toBe(raw);
  });
  it('detects conflicts instead of overwriting another committed change', async () => {
    edit(store);
    workspace.featurePermissionValues = { 'shobiz-am': { clients: 'N' } };
    expect(await store.save()).toBe(false);
    expect(store.error()).toContain('changed since');
    expect(store.changes()).toHaveLength(1);
    expect(workspace.featurePermissionValues['shobiz-am']['clients']).toBe('N');
  });
  it('rechecks Platform Admin access when saving', async () => {
    edit(store);
    auth.session.role = 'Account Manager';
    expect(await store.save()).toBe(false);
    expect(store.error()).toContain('Only Platform Admin');
    expect(store.changes()).toHaveLength(1);
    expect(workspace.featurePermissionValues).toEqual({});
  });
});
