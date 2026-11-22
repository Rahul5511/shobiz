import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="bg-background flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <p class="text-brand mb-4 text-sm font-semibold">404</p>
      <h1 class="text-ink text-3xl font-semibold">This page isn't on the plan.</h1>
      <p class="text-muted mt-4">Let's get you back to your workspace.</p>
      <a routerLink="/login" class="primary-button mt-8">Back to workspace</a>
    </main>
  `,
})
export class NotFound {}
