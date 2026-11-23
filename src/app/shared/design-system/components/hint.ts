import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgageIcon, NgageIconTone } from './icon';

@Component({
  selector: 'ngage-hint',
  imports: [NgageIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
  template: `@if (showIcon()) {
      <ngage-icon name="information" [tone]="tone()" />
    }
    <span><ng-content /></span>`,
  styles: `
    @import '../styles/tokens.css';
    :host {
      display: flex;
      align-items: center;
      gap: var(--ngage-space-1);
      color: var(--ngage-content-tertiary);
      font: var(--ngage-font-regular) var(--ngage-text-m-size) / var(--ngage-text-m-line-height)
        var(--ngage-font-family);
      letter-spacing: var(--ngage-letter-spacing);
    }
    span {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    :host([data-tone='positive']) {
      color: var(--ngage-content-positive);
    }
    :host([data-tone='negative']) {
      color: var(--ngage-content-negative);
    }
    :host([data-tone='notice']) {
      color: var(--ngage-content-alert);
    }
    :host([data-tone='info']) {
      color: var(--ngage-content-info);
    }
  `,
})
export class NgageHint {
  readonly tone =
    input<Extract<NgageIconTone, 'muted' | 'positive' | 'notice' | 'negative' | 'info'>>('muted');
  readonly showIcon = input(true);
}
