import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-login-layout',
  imports: [RouterOutlet],
  host: { class: 'platform-admin' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<main class="auth-screen"><section class="auth-card"><router-outlet /></section></main>',
})
export class LoginLayout {}
