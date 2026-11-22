import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';

import { OperationalReportComponent } from '../../../../shared/workspace/components/operational-report/operational-report';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-registration-vs-attendance-page',
  standalone: true,
  imports: [OperationalReportComponent],
  templateUrl: './registration-vs-attendance.html',
  styleUrl: './registration-vs-attendance.css',
})
export class RegistrationVsAttendancePage {
  s = inject(WorkspaceService);
}
