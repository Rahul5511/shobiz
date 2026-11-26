import { NgageInput, NgageButton } from '../../../../shared/design-system/index';
import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { AccountScreenContext } from '../../../../shared/workspace/models/account-screen-context';
import { AuthService } from '../../../../core/services/login/platform-admin-session';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-change-password-page',
  standalone: true,
  imports: [NgageInput, NgageButton, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePasswordPage {
  context = input.required<AccountScreenContext>();
  s = inject(WorkspaceService);
  auth = inject(AuthService);
  get c() {
    return this.context();
  }
}
