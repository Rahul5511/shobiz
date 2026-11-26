import {
  NgageNav,
  NgageButton,
  NgageInput,
  NgageChoice,
} from '../../../../shared/design-system/index';
import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { AccountScreenContext } from '../../../../shared/workspace/models/account-screen-context';
import { AuthService } from '../../../../core/services/login/platform-admin-session';
import { IconComponent } from '../../../../shared/components/platform-admin/ui.components';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-profile-page',
  standalone: true,
  imports: [NgageNav, NgageButton, NgageInput, NgageChoice, FormsModule, IconComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage {
  context = input.required<AccountScreenContext>();
  s = inject(WorkspaceService);
  auth = inject(AuthService);
  get c() {
    return this.context();
  }
}
