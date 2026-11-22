import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { RecordListComponent } from '../../../../shared/workspace/components/record-list/record-list';
import { RecordFormComponent } from '../../../../shared/workspace/components/record-form/record-form';
import { RecordDetailComponent } from '../../../../shared/workspace/components/record-detail/record-detail';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-clients-page',
  standalone: true,
  imports: [RecordListComponent, RecordFormComponent, RecordDetailComponent],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class ClientsPage {
  readonly s = inject(WorkspaceService);
}
