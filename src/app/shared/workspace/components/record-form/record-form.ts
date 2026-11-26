import { NgageButton, NgageNav, NgageInput } from '../../../design-system/index';
import { WORKSPACE_UI_ACTIONS } from '../../models/workspace-ui-actions';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../data-access/workspace.service';
import { IconComponent } from '../../../components/platform-admin/ui.components';
import { RecordReviewComponent } from '../record-review/record-review';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-workspace-record-form',
  standalone: true,
  imports: [
    NgageButton,
    NgageNav,
    NgageInput,
    CommonModule,
    FormsModule,
    IconComponent,
    RecordReviewComponent,
  ],
  templateUrl: './record-form.html',
  styleUrl: './record-form.css',
})
export class RecordFormComponent {
  s = inject(WorkspaceService);
  keys = Object.keys;
  Object = Object;
  isArray = Array.isArray;
  readonly actions = inject(WORKSPACE_UI_ACTIONS);
  async upload(field: unknown, event: Event) {
    await this.actions.upload(field, event);
  }
}
