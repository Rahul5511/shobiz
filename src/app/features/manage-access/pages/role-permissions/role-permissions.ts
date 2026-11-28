import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgageButton,
  NgageInput,
  NgageChoice,
  NgageIcon,
  NgageTag,
  NgageAlert,
  NgageModal,
  NgagePopover,
} from '../../../../shared/design-system';
import { PermissionRepository } from '../../data-access/permission.repository';
import { RolePermissionsStore } from '../../state/role-permissions.store';
import {
  PermissionMatrix,
  PermissionCellSelection,
} from '../../components/permission-matrix/permission-matrix';
import { PermissionRoleView } from '../../components/permission-role-view/permission-role-view';
import { PermissionReview } from '../../components/permission-review/permission-review';
import { PermissionOptions } from '../../components/permission-options/permission-options';
import {
  PermissionLevel,
  PERMISSION_LABELS,
  permissionChangeKind,
  validPermissionOptions,
  permissionCellKey,
} from '../../../../core/permissions/feature-permissions';
@Component({
  selector: 'app-role-permissions-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgageButton,
    NgageInput,
    NgageChoice,
    NgageIcon,
    NgageTag,
    NgageAlert,
    NgageModal,
    NgagePopover,
    PermissionMatrix,
    PermissionOptions,
    PermissionRoleView,
    PermissionReview,
  ],
  providers: [PermissionRepository, RolePermissionsStore],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.css',
})
export class RolePermissionsPage implements OnInit {
  readonly store = inject(RolePermissionsStore);
  readonly labels = PERMISSION_LABELS;
  readonly validOptions = validPermissionOptions;
  readonly popoverRestore = signal(true);
  readonly cell = signal<PermissionCellSelection | null>(null);
  readonly roleFilterAnchor = signal<HTMLElement | null>(null);
  readonly activeCellKey = computed(() => {
    const cell = this.cell();
    return cell ? permissionCellKey(cell.role.id, cell.feature.id) : null;
  });
  readonly dialog = signal<'review' | 'discard' | null>(null);
  readonly reviewing = computed(() => {
    const roles = new Map(this.store.roles().map((role) => [role.id, role.name]));
    const features = new Map(this.store.features().map((feature) => [feature.id, feature.name]));
    return this.store.changes().map((change) => ({
      ...change,
      role: roles.get(change.roleId) || change.roleId,
      feature: features.get(change.featureId) || change.featureId,
      kind: permissionChangeKind(change),
    }));
  });
  ngOnInit() {
    void this.store.load();
  }
  get saving() {
    return this.store.status() === 'saving';
  }
  get popoverAnchor() {
    return this.cell()?.anchor || this.roleFilterAnchor();
  }
  get popoverHeading() {
    return this.cell()?.feature.name || 'Filter roles';
  }
  get roleFilterLabel() {
    const ids = this.store.roleIds();
    return ids === null ? 'All roles' : ids.length + ' roles';
  }
  openCell(selection: PermissionCellSelection) {
    this.popoverRestore.set(true);
    this.roleFilterAnchor.set(null);
    this.cell.set(selection);
  }
  closePopover(restore = false) {
    this.popoverRestore.set(restore);
    this.cell.set(null);
    this.roleFilterAnchor.set(null);
  }
  openRoleFilter(event: Event) {
    this.popoverRestore.set(true);
    const previous = this.roleFilterAnchor();
    this.cell.set(null);
    this.roleFilterAnchor.set(previous ? null : (event.currentTarget as HTMLElement));
  }
  selectPermission(next: PermissionLevel) {
    const cell = this.cell();
    if (cell) this.store.setPermission(cell.role, cell.feature, next);
    this.closePopover(true);
  }
  setMode(mode: 'matrix' | 'role') {
    this.closePopover();
    this.store.mode.set(mode);
  }
  search(value: string) {
    this.closePopover();
    this.store.setSearch(value);
  }
  filterModule(value: string) {
    this.closePopover();
    this.store.setModule(value);
  }
  clearFilters() {
    this.closePopover();
    this.store.clearFilters();
  }
  toggleModule(id: string) {
    this.closePopover();
    this.store.toggleModule(id);
  }
  roleChecked(id: string) {
    return this.store.roleIds() === null || this.store.roleIds()!.includes(id);
  }
  requestReview() {
    if (this.saving || !this.store.changes().length) return;
    this.closePopover();
    this.dialog.set('review');
  }
  requestDiscard() {
    if (this.saving || !this.store.changes().length) return;
    this.closePopover();
    this.dialog.set('discard');
  }
  closeDialog() {
    if (!this.saving) this.dialog.set(null);
  }
  discard() {
    this.store.discard();
    this.dialog.set(null);
    void this.store.load();
  }
  async confirmSave() {
    if (await this.store.save()) this.dialog.set(null);
  }
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent) {
    if (this.store.changes().length) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}
