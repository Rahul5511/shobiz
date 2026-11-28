import { Injectable, inject } from '@angular/core';
import { WorkspaceService } from '../../../shared/workspace/data-access/workspace.service';
import { canOpenPlatformAdminPage } from '../../../core/permissions/platform-admin-policy';
import {
  PermissionChange,
  PERMISSION_FEATURES,
  permissionRoles,
  initialPermissionValues,
} from '../../../core/permissions/feature-permissions';
/** Local adapter for the supplied dummy data. Replace these boundaries with feature APIs. */
@Injectable()
export class PermissionRepository {
  private readonly workspace = inject(WorkspaceService);
  get canConfigure() {
    return canOpenPlatformAdminPage(this.workspace.role, 'RolePermissions');
  }
  async load() {
    if (!this.canConfigure) throw new Error('Only Platform Admin can configure permissions.');
    const roles = permissionRoles(this.workspace.rows.RoleBuilder);
    return {
      roles,
      features: PERMISSION_FEATURES,
      values: initialPermissionValues(
        roles,
        PERMISSION_FEATURES,
        this.workspace.featurePermissionValues,
      ),
    };
  }
  async save(changes: PermissionChange[]) {
    return this.workspace.saveFeaturePermissions(changes);
  }
}
