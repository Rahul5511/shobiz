import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgageIcon } from './icon';

export type NgageButtonVariant = 'primary' | 'ghost' | 'border' | 'icon-solid' | 'icon-border';

@Component({
  selector: 'button[ngageButton]',
  imports: [NgageIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  template: `
    @if (leadingIcon()) {
      <ngage-icon class="normal-icon" name="add" [tone]="solid ? 'inverse' : 'primary'" />
      <ngage-icon class="hover-icon" name="add" [tone]="solid ? 'inverse' : 'brand'" />
      <ngage-icon class="disabled-icon" name="add" tone="disabled" />
    }
    <span class="label"><ng-content /></span>
    @if (trailingIcon() && !iconOnly) {
      <ngage-icon class="normal-icon" name="chevron-down" [tone]="solid ? 'inverse' : 'primary'" />
      <ngage-icon class="hover-icon" name="chevron-down" [tone]="solid ? 'inverse' : 'brand'" />
      <ngage-icon class="disabled-icon" name="chevron-down" tone="disabled" />
    }
  `,
  styleUrl: './button.css',
})
export class NgageButton {
  readonly variant = input<NgageButtonVariant>('primary');
  readonly size = input<'default' | 'large'>('default');
  readonly leadingIcon = input(true);
  readonly trailingIcon = input(true);
  get solid(): boolean {
    return this.variant() === 'primary' || this.variant() === 'icon-solid';
  }
  get iconOnly(): boolean {
    return this.variant() === 'icon-solid' || this.variant() === 'icon-border';
  }
}
