import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { IconComponent } from '../../../../shared/components/platform-admin/ui.components';
import { EventDashboardComponent } from '../../../events/events';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [IconComponent, EventDashboardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage {
  s = inject(WorkspaceService);
}
