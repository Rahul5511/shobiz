import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-registration-qr-page',
  standalone: true,
  imports: [],
  templateUrl: './registration-qr.html',
  styleUrl: './registration-qr.css',
})
export class RegistrationQrPage {
  s = inject(WorkspaceService);
}
