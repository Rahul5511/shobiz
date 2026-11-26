import { NgageInput, NgageButton } from '../../../../shared/design-system/index';
import {
  Component,
  inject,
  viewChild,
  ElementRef,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
@Component({
  selector: 'app-disable-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgageInput, NgageButton, FormsModule],
  templateUrl: './disable-user.html',
  styleUrl: './disable-user.css',
})
export class DisableUserDialog {
  s = inject(WorkspaceService);
  dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  constructor() {
    afterNextRender(() => this.dialog()?.nativeElement.showModal?.());
  }
}
