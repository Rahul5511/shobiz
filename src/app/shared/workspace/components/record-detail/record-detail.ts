import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { WorkspaceService } from '../../data-access/workspace.service';
import { DataTableComponent } from '../../../components/platform-admin/ui.components';
import { RecordReviewComponent } from '../record-review/record-review';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-workspace-record-detail',
  standalone: true,
  imports: [DataTableComponent, RecordReviewComponent],
  templateUrl: './record-detail.html',
  styleUrl: './record-detail.css',
})
export class RecordDetailComponent {
  s = inject(WorkspaceService);
  keys = Object.keys;
  Object = Object;
  isArray = Array.isArray;
}
