import { ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { NgageHint } from './hint';

/** Apply to a native control; Angular forms retain value/disabled ownership. */
@Directive({
  selector: 'input[ngageInput], textarea[ngageInput], select[ngageInput]',
  host: { class: 'ngage-control' },
})
export class NgageInput {}

@Component({
  selector: 'ngage-form-field',
  imports: [NgageHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-state]': 'state()' },
  template: `
    <label [for]="controlId()"
      >{{ label() }}
      @if (required()) {
        <span class="required" aria-hidden="true">*</span>
      }
    </label>
    <div class="control-slot"><ng-content /></div>
    @if (hint()) {
      <ngage-hint
        [id]="controlId() + '-hint'"
        [tone]="state() === 'error' ? 'negative' : state() === 'success' ? 'positive' : 'muted'"
        >{{ hint() }}</ngage-hint
      >
    }
  `,
  styleUrl: './form-field.css',
})
export class NgageFormField {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly hint = input('');
  readonly state = input<'default' | 'error' | 'success'>('default');
}
