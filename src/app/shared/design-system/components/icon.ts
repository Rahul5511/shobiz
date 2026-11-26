import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NGAGE_ICON_ASSETS, NgageGlyphName } from './icon-assets';

export type NgageIconName =
  NgageGlyphName | 'add' | 'chevron-down' | 'check' | 'close' | 'information';
export type NgageIconTone =
  | 'inherit'
  | 'primary'
  | 'inverse'
  | 'brand'
  | 'disabled'
  | 'positive'
  | 'notice'
  | 'negative'
  | 'info'
  | 'muted';

const aliases: Partial<Record<NgageIconName, NgageGlyphName>> = {
  add: 'add-01',
  'chevron-down': 'arrow-down-01',
  check: 'tick-02',
  close: 'cancel-01',
  information: 'information-circle',
};

/** Exported geometry with inherited color; no duplicate icons for interaction states. */
@Component({
  selector: 'ngage-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-icon]': 'name()', '[attr.data-tone]': 'tone()' },
  template: `<span [style.mask-image]="mask" [style.-webkit-mask-image]="mask"></span>`,
  styles: `
    :host {
      display: inline-flex;
      position: relative;
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
      align-items: center;
      justify-content: center;
    }
    :host([data-icon='information']) {
      width: 16px;
      height: 16px;
    }
    :host([data-icon='check']) {
      width: 20px;
      height: 20px;
    }
    :host([data-icon='close']) {
      width: 24px;
      height: 24px;
    }
    span {
      display: block;
      width: 100%;
      height: 100%;
      background: currentColor;
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
    }
    :host([data-tone='primary']) {
      color: var(--ngage-content-primary);
    }
    :host([data-tone='inverse']) {
      color: var(--ngage-content-primary-inverse);
    }
    :host([data-tone='brand']) {
      color: var(--ngage-content-brand);
    }
    :host([data-tone='disabled']) {
      color: var(--ngage-content-disabled);
    }
    :host([data-tone='positive']) {
      color: var(--ngage-content-positive);
    }
    :host([data-tone='notice']) {
      color: var(--ngage-content-alert);
    }
    :host([data-tone='negative']) {
      color: var(--ngage-content-negative);
    }
    :host([data-tone='info']) {
      color: var(--ngage-content-info);
    }
    :host([data-tone='muted']) {
      color: var(--ngage-content-tertiary);
    }
  `,
})
export class NgageIcon {
  readonly name = input.required<NgageIconName>();
  readonly tone = input<NgageIconTone>('inherit');
  readonly iconStyle = input<'stroke' | 'solid' | 'duotone' | 'twotone' | 'bulk'>('stroke');
  readonly shape = input<'rounded' | 'sharp' | 'standard'>('rounded');

  get source(): string {
    const name = aliases[this.name()] ?? this.name();
    return (
      NGAGE_ICON_ASSETS[`${name}/${this.iconStyle()}/${this.shape()}`] ??
      NGAGE_ICON_ASSETS[`${name}/stroke/rounded`]
    );
  }
  get mask(): string {
    return `url("${this.source}")`;
  }
}
