import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSession } from '../../../core/services/login/auth-session.service';

@Component({
  selector: 'app-events',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {
  protected readonly session = inject(AuthSession);
}
