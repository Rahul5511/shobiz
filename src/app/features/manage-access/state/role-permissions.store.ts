import { Injectable, PendingTasks, computed, inject, signal } from '@angular/core';
import { PermissionRepository } from '../data-access/permission.repository';
import {
  PermissionRole,
  PermissionFeature,
  PermissionGroup,
  PermissionValues,
  PermissionChange,
  PermissionLevel,
  permissionCellKey,
  validPermissionOptions,
} from '../../../core/permissions/feature-permissions';
@Injectable()
export class RolePermissionsStore {
  readonly repository = inject(PermissionRepository);
  private readonly pendingTasks = inject(PendingTasks);
  readonly roles = signal<PermissionRole[]>([]);
  readonly features = signal<PermissionFeature[]>([]);
  readonly original = signal<PermissionValues>({});
  readonly values = signal<PermissionValues>({});
  readonly status = signal<'loading' | 'ready' | 'saving' | 'saved' | 'error'>('loading');
  readonly error = signal('');
  readonly search = signal('');
  readonly moduleFilter = signal('');
  readonly roleIds = signal<string[] | null>(null);
  readonly changedOnly = signal(false);
  readonly collapsed = signal<Set<string>>(new Set());
  readonly mode = signal<'matrix' | 'role'>('matrix');
  readonly selectedRoleId = signal('shobiz-am');
  readonly visibleRoles = computed(() => {
    const ids = this.roleIds();
    return ids === null ? this.roles() : this.roles().filter((role) => ids.includes(role.id));
  });
  readonly selectedRole = computed(
    () =>
      this.visibleRoles().find((role) => role.id === this.selectedRoleId()) ||
      this.visibleRoles()[0],
  );
  readonly modules = computed(() => [...new Set(this.features().map((feature) => feature.module))]);
  readonly changes = computed<PermissionChange[]>(() => {
    const values = this.values(),
      original = this.original();
    const changes: PermissionChange[] = [];
    for (const role of this.roles())
      for (const feature of this.features()) {
        const previous = original[role.id]?.[feature.id],
          next = values[role.id]?.[feature.id];
        if (previous && next && previous !== next)
          changes.push({ roleId: role.id, featureId: feature.id, previous, next });
      }
    return changes;
  });
  readonly changedKeys = computed(
    () =>
      new Set(this.changes().map((change) => permissionCellKey(change.roleId, change.featureId))),
  );
  readonly groups = computed<PermissionGroup[]>(() => {
    const query = this.search().trim().toLowerCase();
    const roles = this.visibleRoles();
    const changes = this.changedKeys();
    return this.modules()
      .filter((module) => !this.moduleFilter() || module === this.moduleFilter())
      .map((module) => {
        const all = this.features().filter((feature) => feature.module === module);
        return {
          id: module,
          name: module,
          total: all.length,
          modified: this.changes().filter((change) =>
            all.some((feature) => feature.id === change.featureId),
          ).length,
          features: all.filter(
            (feature) =>
              (!query || (feature.name + ' ' + feature.module).toLowerCase().includes(query)) &&
              (!this.changedOnly() ||
                roles.some((role) => changes.has(permissionCellKey(role.id, feature.id)))),
          ),
        };
      })
      .filter((group) => group.features.length > 0);
  });
  get canConfigure() {
    return this.repository.canConfigure;
  }
  async load() {
    const done = this.pendingTasks.add();
    this.status.set('loading');
    this.error.set('');
    try {
      const result = await this.repository.load();
      this.roles.set(result.roles);
      this.features.set(result.features);
      this.original.set(result.values);
      this.values.set(structuredClone(result.values));
      this.status.set('ready');
    } catch (error) {
      this.status.set('error');
      this.error.set(error instanceof Error ? error.message : 'Unable to load permissions.');
    } finally {
      done();
    }
  }
  level(roleId: string, featureId: string): PermissionLevel {
    return this.values()[roleId]?.[featureId] || 'N';
  }
  setPermission(role: PermissionRole, feature: PermissionFeature, next: PermissionLevel) {
    if (
      !this.canConfigure ||
      this.status() === 'saving' ||
      role.fixed ||
      !validPermissionOptions(role, feature).includes(next)
    )
      return;
    this.values.update((values) => ({
      ...values,
      [role.id]: { ...values[role.id], [feature.id]: next },
    }));
    this.status.set('ready');
    this.error.set('');
  }
  setSearch(value: string) {
    this.search.set(value);
    this.expandMatching();
  }
  setModule(value: string) {
    this.moduleFilter.set(value);
    this.expandMatching();
  }
  setChangedOnly(value: boolean) {
    this.changedOnly.set(value);
    this.expandMatching();
  }
  toggleRole(id: string, checked: boolean) {
    const ids = new Set(this.roleIds() ?? this.roles().map((role) => role.id));
    checked ? ids.add(id) : ids.delete(id);
    this.roleIds.set([...ids]);
  }
  toggleModule(id: string) {
    this.collapsed.update((value) => {
      const next = new Set(value);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  expandAll() {
    this.collapsed.set(new Set());
  }
  collapseAll() {
    this.collapsed.set(new Set(this.modules()));
  }
  private expandMatching() {
    this.collapsed.update((value) => {
      const next = new Set(value);
      for (const group of this.groups()) next.delete(group.id);
      return next;
    });
  }
  clearFilters() {
    this.search.set('');
    this.moduleFilter.set('');
    this.roleIds.set(null);
    this.changedOnly.set(false);
    this.expandAll();
  }
  discard() {
    if (this.status() === 'saving') return;
    this.values.set(structuredClone(this.original()));
    this.error.set('');
    this.status.set('ready');
  }
  async save() {
    if (!this.changes().length || this.status() === 'saving') return false;
    const done = this.pendingTasks.add();
    const changes = this.changes();
    const snapshot = structuredClone(this.values());
    this.status.set('saving');
    this.error.set('');
    try {
      const result = await this.repository.save(changes);
      if (!result.success) throw new Error(result.error || 'Unable to save permissions.');
      this.original.set(snapshot);
      this.status.set('saved');
      return true;
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to save permissions.');
      this.status.set('error');
      return false;
    } finally {
      done();
    }
  }
}
