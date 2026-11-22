import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { RecordListComponent } from '../../../../shared/workspace/components/record-list/record-list';
import { RecordFormComponent } from '../../../../shared/workspace/components/record-form/record-form';
import { RecordDetailComponent } from '../../../../shared/workspace/components/record-detail/record-detail';
import { EventDashboardComponent } from '../../components/event-dashboard/event-dashboard.component';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-events-page',
  standalone: true,
  imports: [
    RecordListComponent,
    RecordFormComponent,
    RecordDetailComponent,
    EventDashboardComponent,
  ],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class EventsPage {
  readonly s = inject(WorkspaceService);
}
