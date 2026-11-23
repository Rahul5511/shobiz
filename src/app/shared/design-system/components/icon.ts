import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NgageIconName = 'add' | 'chevron-down' | 'check' | 'close' | 'information';
export type NgageIconTone =
  | 'primary'
  | 'inverse'
  | 'brand'
  | 'disabled'
  | 'positive'
  | 'notice'
  | 'negative'
  | 'info'
  | 'muted';

const addSuffix: Partial<Record<NgageIconTone, string>> = {
  inverse: '',
  brand: '4',
  disabled: '6',
};
const chevronSuffix: Partial<Record<NgageIconTone, string>> = {
  inverse: '1',
  brand: '5',
  disabled: '7',
};
const informationSuffix: Partial<Record<NgageIconTone, string>> = {
  positive: '1',
  notice: '2',
  negative: '3',
  info: '4',
};

/** Original Figma SVGs, placed inside the design's original icon slots. */
@Component({
  selector: 'ngage-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-icon]': 'name()' },
  template: `<img [src]="source" alt="" draggable="false" />`,
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
    img {
      display: block;
      max-width: none;
    }
  `,
})
export class NgageIcon {
  readonly name = input.required<NgageIconName>();
  readonly tone = input<NgageIconTone>('primary');

  get source(): string {
    const tone = this.tone();
    switch (this.name()) {
      case 'add':
        return 'ngage/icons/button-imgElements' + (addSuffix[tone] ?? '2') + '.svg';
      case 'chevron-down':
        return 'ngage/icons/button-imgElements' + (chevronSuffix[tone] ?? '3') + '.svg';
      case 'check':
        return 'ngage/icons/snackbar-imgElements.svg';
      case 'close':
        return tone === 'inverse'
          ? 'ngage/icons/snackbar-imgElements1.svg'
          : 'ngage/icons/modal-imgElements.svg';
      case 'information':
        return 'ngage/icons/hint-imgElements' + (informationSuffix[tone] ?? '') + '.svg';
    }
  }
}
