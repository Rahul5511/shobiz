import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../data-access/workspace.service';
import { DataTableComponent } from '../../../components/platform-admin/ui.components';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-workspace-operational-report',
  standalone: true,
  imports: [FormsModule, DataTableComponent],
  templateUrl: './operational-report.html',
  styleUrl: './operational-report.css',
})
export class OperationalReportComponent {
  s = inject(WorkspaceService);
  keys = Object.keys;
  Object = Object;
  isArray = Array.isArray;
}
