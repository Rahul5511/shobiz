import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgageIcon } from './icon';

/** Figma Snackbar. Visibility and dismissal remain owned by the consumer. */
@Component({
  selector: 'ngage-alert',
  imports: [NgageIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.role]': "tone() === 'negative' ? 'alert' : 'status'",
    'aria-atomic': 'true',
  },
  template: `
    @if (showIcon()) {
      <ngage-icon [name]="tone() === 'positive' ? 'check' : 'information'" />
    }
    <span class="message"><ng-content /></span>
    @if (dismissible()) {
      <button type="button" [attr.aria-label]="dismissLabel()" (click)="dismissed.emit()">
        <ngage-icon name="close" />
      </button>
    }
  `,
  styleUrl: './alert.css',
})
export class NgageAlert {
  readonly tone = input<'standard' | 'positive' | 'negative' | 'alert' | 'info'>('standard');
  readonly showIcon = input(true);
  readonly dismissible = input(true);
  readonly dismissLabel = input('Dismiss notification');
  readonly dismissed = output<void>();
}
