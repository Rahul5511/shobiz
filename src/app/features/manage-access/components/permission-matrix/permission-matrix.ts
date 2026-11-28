import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgageIcon, NgageButton } from '../../../../shared/design-system';
import {
  PermissionRole,
  PermissionFeature,
  PermissionGroup,
  PermissionValues,
  PermissionLevel,
  validPermissionOptions,
  permissionCellKey,
  PERMISSION_LABELS,
} from '../../../../core/permissions/feature-permissions';
export interface PermissionCellSelection {
  role: PermissionRole;
  feature: PermissionFeature;
  anchor: HTMLElement;
}
@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgageIcon, NgageButton],
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.css',
})
export class PermissionMatrix {
  readonly roles = input.required<PermissionRole[]>();
  readonly groups = input.required<PermissionGroup[]>();
  readonly values = input.required<PermissionValues>();
  readonly changedKeys = input.required<Set<string>>();
  readonly collapsed = input.required<Set<string>>();
  readonly disabled = input(false);
  readonly activeKey = input<string | null>(null);
  readonly key = permissionCellKey;
  readonly selected = output<PermissionCellSelection>();
  readonly toggled = output<string>();
  readonly labels = PERMISSION_LABELS;
  level(role: PermissionRole, feature: PermissionFeature): PermissionLevel {
    return role.fixed ? 'M' : this.values()[role.id]?.[feature.id] || 'N';
  }
  modified(role: PermissionRole, feature: PermissionFeature) {
    return this.changedKeys().has(permissionCellKey(role.id, feature.id));
  }
  protected(role: PermissionRole, feature: PermissionFeature) {
    return role.fixed || validPermissionOptions(role, feature).length < 2;
  }
  explanation(role: PermissionRole, feature: PermissionFeature) {
    return role.fixed
      ? 'Platform Admin always has Manage access and cannot be modified.'
      : validPermissionOptions(role, feature).length < 2
        ? 'This permission is restricted for this role.'
        : role.name + ' - ' + feature.name + ': ' + this.labels[this.level(role, feature)];
  }
  open(role: PermissionRole, feature: PermissionFeature, event: Event) {
    if (!this.disabled() && !this.protected(role, feature))
      this.selected.emit({ role, feature, anchor: event.currentTarget as HTMLElement });
  }
  onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.hasAttribute('data-permission-cell') ||
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
    )
      return;
    const row = target.closest('tr')!;
    const table = target.closest('table')!;
    const cells = Array.from(
      (event.ctrlKey ? table : row).querySelectorAll<HTMLButtonElement>(
        'button[data-permission-cell]:not(:disabled)',
      ),
    );
    const choices = ['ArrowUp', 'ArrowDown'].includes(event.key)
      ? Array.from(
          table.querySelectorAll<HTMLButtonElement>('button[data-permission-cell]:not(:disabled)'),
        ).filter((cell) => cell.dataset['role'] === target.dataset['role'])
      : cells;
    if (!choices.length) return;
    event.preventDefault();
    const index = choices.indexOf(target as HTMLButtonElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? choices.length - 1
          : Math.max(
              0,
              Math.min(
                choices.length - 1,
                index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1),
              ),
            );
    choices[next].focus();
  }
}
