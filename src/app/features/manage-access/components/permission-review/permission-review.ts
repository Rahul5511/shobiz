import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgageModal, NgageButton, NgageTag, NgageAlert } from '../../../../shared/design-system';
import {
  PermissionChange,
  PERMISSION_LABELS,
} from '../../../../core/permissions/feature-permissions';
export interface PermissionReviewRow extends PermissionChange {
  role: string;
  feature: string;
  kind: 'Granted' | 'Reduced' | 'Removed';
}
@Component({
  selector: 'app-permission-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgageModal, NgageButton, NgageTag, NgageAlert],
  templateUrl: './permission-review.html',
  styleUrl: './permission-review.css',
})
export class PermissionReview {
  readonly changes = input.required<PermissionReviewRow[]>();
  readonly isOpen = input(false);
  readonly saving = input(false);
  readonly error = input('');
  readonly continued = output<void>();
  readonly confirmed = output<void>();
  readonly labels = PERMISSION_LABELS;
}
