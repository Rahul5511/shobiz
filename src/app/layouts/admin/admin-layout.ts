import { NgageButton } from '../../shared/design-system/index';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthSession } from '../../core/services/login/auth-session.service';
import { Brand } from '../../shared/components/brand/brand';

@Component({
  selector: 'app-admin-layout',
  imports: [NgageButton, Brand, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background min-h-dvh">
      <header
        class="border-line bg-surface flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 sm:px-12"
      >
        <app-brand class="text-brand-deep" />
        <div class="flex items-center gap-5">
          <span class="text-muted hidden text-sm sm:inline">{{ session.user()?.name }}</span>
          <button type="button" (click)="logout()" ngageButton variant="border">Sign out</button>
        </div>
      </header>
      <main class="mx-auto max-w-5xl px-6 py-14 sm:px-12"><router-outlet /></main>
    </div>
  `,
})
export class AdminLayout {
  protected readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  protected logout(): void {
    this.session.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
