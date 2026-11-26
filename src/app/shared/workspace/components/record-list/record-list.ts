import { NgageAlert, NgageInput, NgageButton } from '../../../design-system/index';
import { WORKSPACE_UI_ACTIONS } from '../../models/workspace-ui-actions';
import { FormsModule } from '@angular/forms';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { WorkspaceService } from '../../data-access/workspace.service';
import { RecordCardComponent } from '../../../components/platform-admin/ui.components';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-workspace-record-list',
  standalone: true,
  imports: [NgageAlert, NgageInput, NgageButton, RecordCardComponent, FormsModule],
  templateUrl: './record-list.html',
  styleUrl: './record-list.css',
})
export class RecordListComponent {
  s = inject(WorkspaceService);
  keys = Object.keys;
  Object = Object;
  isArray = Array.isArray;
  readonly actions = inject(WORKSPACE_UI_ACTIONS);
  async showQr(row: unknown) {
    await this.actions.showQr(row);
  }
}
