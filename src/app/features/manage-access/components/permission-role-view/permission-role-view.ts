import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgageButton, NgageIcon, NgageTag } from '../../../../shared/design-system';
import {
  PermissionRole,
  PermissionFeature,
  PermissionGroup,
  PermissionValues,
  PermissionLevel,
  validPermissionOptions,
  permissionCellKey,
} from '../../../../core/permissions/feature-permissions';
import { PermissionOptions } from '../permission-options/permission-options';
@Component({
  selector: 'app-permission-role-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgageButton, NgageIcon, NgageTag, PermissionOptions],
  templateUrl: './permission-role-view.html',
  styleUrl: './permission-role-view.css',
})
export class PermissionRoleView {
  readonly role = input.required<PermissionRole>();
  readonly groups = input.required<PermissionGroup[]>();
  readonly values = input.required<PermissionValues>();
  readonly changedKeys = input.required<Set<string>>();
  readonly collapsed = input.required<Set<string>>();
  readonly disabled = input(false);
  readonly toggled = output<string>();
  readonly changed = output<{ feature: PermissionFeature; level: PermissionLevel }>();
  readonly validOptions = validPermissionOptions;
  level(feature: PermissionFeature): PermissionLevel {
    return this.role().fixed ? 'M' : this.values()[this.role().id]?.[feature.id] || 'N';
  }
  isChanged(feature: PermissionFeature) {
    return this.changedKeys().has(permissionCellKey(this.role().id, feature.id));
  }
}
