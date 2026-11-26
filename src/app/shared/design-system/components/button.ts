import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgageIcon } from './icon';

export type NgageButtonVariant = 'primary' | 'ghost' | 'border' | 'icon-solid' | 'icon-border';

@Component({
  selector: 'button[ngageButton], a[ngageButton]',
  imports: [NgageIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  template: `
    @if (leadingIcon() || iconOnly) {
      <ngage-icon name="add" />
    }
    <span class="label"><ng-content /></span>
    @if (trailingIcon() && !iconOnly) {
      <ngage-icon name="chevron-down" />
    }
  `,
  styleUrl: './button.css',
})
export class NgageButton {
  readonly variant = input<NgageButtonVariant>('primary');
  readonly size = input<'default' | 'large'>('default');
  readonly leadingIcon = input(false);
  readonly trailingIcon = input(false);
  get solid(): boolean {
    return this.variant() === 'primary' || this.variant() === 'icon-solid';
  }
  get iconOnly(): boolean {
    return this.variant() === 'icon-solid' || this.variant() === 'icon-border';
  }
}
