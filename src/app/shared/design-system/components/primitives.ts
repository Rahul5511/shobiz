import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
  output,
  signal,
} from '@angular/core';

export type NgageTone = 'neutral' | 'brand' | 'positive' | 'negative' | 'alert' | 'info';

/** One tag for all tones, sizes, disabled and optional removal states. */
@Component({
  selector: 'ngage-tag, span[ngageTag]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngage-tag',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'disabled() || null',
  },
  template: `<ng-content />
    @if (removable()) {
      <button
        type="button"
        class="ngage-tag-remove"
        [disabled]="disabled()"
        [attr.aria-label]="removeLabel()"
        (click)="removed.emit()"
      >
        ×
      </button>
    }`,
})
export class NgageTag {
  readonly tone = input<NgageTone>('neutral');
  readonly size = input<'small' | 'default'>('default');
  readonly disabled = input(false);
  readonly removable = input(false);
  readonly removeLabel = input('Remove tag');
  readonly removed = output<void>();
}

/** Selection stays with the consumer. Native disabled/click behavior is retained. */
@Directive({
  selector: 'button[ngageChip]',
  host: {
    class: 'ngage-chip',
    '[attr.aria-pressed]': 'selected()',
    '[attr.data-selected]': 'selected()',
  },
})
export class NgageChip {
  readonly selected = input(false);
}

/** Native input owns checked, disabled, events and Angular forms integration. */
@Directive({
  selector: 'input[ngageChoice]',
  host: {
    class: 'ngage-choice',
    '[attr.role]': "ngageChoice() === 'switch' ? 'switch' : null",
    '[attr.data-choice]': 'ngageChoice()',
  },
})
export class NgageChoice {
  readonly ngageChoice = input<'checkbox' | 'radio' | 'switch' | ''>('');
}

/** A navigation button, not an ARIA tablist without its keyboard contract. */
@Directive({
  selector: 'button[ngageNav]',
  host: {
    class: 'ngage-nav',
    '[attr.aria-current]': "selected() ? 'page' : null",
    '[attr.data-selected]': 'selected()',
  },
})
export class NgageNav {
  readonly selected = input(false);
}

@Directive({ selector: 'progress[ngageProgress]', host: { class: 'ngage-progress' } })
export class NgageProgress {}

@Directive({ selector: '[ngageDivider]', host: { class: 'ngage-divider', role: 'separator' } })
export class NgageDivider {}

@Component({
  selector: 'ngage-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ngage-avatar', role: 'img', '[attr.aria-label]': 'label()' },
  template: `@if (src() && failedSource() !== src()) {
      <img [src]="src()" alt="" (error)="failedSource.set(src())" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }`,
})
export class NgageAvatar {
  readonly label = input.required<string>();
  readonly initials = input('');
  readonly src = input('');
  readonly failedSource = signal('');
}
