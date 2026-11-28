import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgageButton } from '../../../../shared/design-system';
import {
  PermissionLevel,
  PERMISSION_LABELS,
} from '../../../../core/permissions/feature-permissions';
@Component({
  selector: 'app-permission-options',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgageButton],
  templateUrl: './permission-options.html',
  styleUrl: './permission-options.css',
})
export class PermissionOptions {
  readonly value = input.required<PermissionLevel>();
  readonly options = input.required<PermissionLevel[]>();
  readonly label = input('Permission');
  readonly compact = input(false);
  readonly disabled = input(false);
  readonly changed = output<PermissionLevel>();
  readonly labels = PERMISSION_LABELS;
}
