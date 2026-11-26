import { NgageButton } from '../../../design-system/index';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { WorkspaceService } from '../../data-access/workspace.service';
import {
  IconComponent,
  DataTableComponent,
} from '../../../components/platform-admin/ui.components';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-workspace-record-review',
  standalone: true,
  imports: [NgageButton, IconComponent, DataTableComponent],
  templateUrl: './record-review.html',
  styleUrl: './record-review.css',
})
export class RecordReviewComponent {
  s = inject(WorkspaceService);
  keys = Object.keys;
  Object = Object;
  isArray = Array.isArray;
}
