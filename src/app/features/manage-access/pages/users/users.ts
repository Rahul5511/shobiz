import { FormsModule } from '@angular/forms';
import { DisableUserDialog } from '../../components/disable-user/disable-user';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { RecordListComponent } from '../../../../shared/workspace/components/record-list/record-list';
import { RecordFormComponent } from '../../../../shared/workspace/components/record-form/record-form';
import { RecordDetailComponent } from '../../../../shared/workspace/components/record-detail/record-detail';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-users-page',
  standalone: true,
  imports: [
    RecordListComponent,
    RecordFormComponent,
    RecordDetailComponent,
    FormsModule,
    DisableUserDialog,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersPage {
  readonly s = inject(WorkspaceService);
}
