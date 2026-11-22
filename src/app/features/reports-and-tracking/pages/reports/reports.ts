import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';

import { OperationalReportComponent } from '../../../../shared/workspace/components/operational-report/operational-report';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-reports-page',
  standalone: true,
  imports: [OperationalReportComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsPage {
  s = inject(WorkspaceService);
}
