import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';

export interface EventDraft {
  readonly name: string;
  readonly needsApproval: boolean;
  readonly approvalNote: string | null;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" [attr.aria-busy]="saving()">
      <fieldset [disabled]="saving()">
        <legend>Event details</legend>
        <label>
          Event name
          <input
            formControlName="name"
            required
            maxlength="120"
            [attr.aria-invalid]="form.controls.name.touched && form.controls.name.invalid"
            [attr.aria-describedby]="
              form.controls.name.touched && form.controls.name.invalid ? nameErrorId() : null
            "
          />
        </label>
        @if (form.controls.name.touched && form.controls.name.invalid) {
          <p [id]="nameErrorId()">Enter an event name, up to 120 characters.</p>
        }
        <label>
          <input type="checkbox" formControlName="needsApproval" />
          Requires approval
        </label>
        @if (form.controls.needsApproval.value) {
          <label>
            Approval note
            <textarea
              formControlName="approvalNote"
              required
              maxlength="500"
              [attr.aria-invalid]="
                form.controls.approvalNote.touched && form.controls.approvalNote.invalid
              "
              [attr.aria-describedby]="
                form.controls.approvalNote.touched && form.controls.approvalNote.invalid
                  ? noteErrorId()
                  : null
              "
            ></textarea>
          </label>
          @if (form.controls.approvalNote.touched && form.controls.approvalNote.invalid) {
            <p [id]="noteErrorId()">Enter an approval note, up to 500 characters.</p>
          }
        }
        @if (serverError()) {
          <p role="alert">{{ serverError() }}</p>
        }
        <button type="submit" [disabled]="saving() || form.pending || form.invalid">
          {{ saving() ? 'Saving...' : 'Save event' }}
        </button>
      </fieldset>
    </form>
  `,
})
export class EventForm {
  private readonly fb = inject(FormBuilder).nonNullable;
  // Owner supplies distinct IDs if multiple instances appear on the same page.
  readonly nameErrorId = input.required<string>();
  readonly noteErrorId = input.required<string>();
  readonly saving = input(false);
  readonly serverError = input<string | null>(null);
  readonly saveRequested = output<EventDraft>();
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(/\S/)]],
    needsApproval: [false],
    approvalNote: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    this.form.controls.needsApproval.valueChanges
      .pipe(startWith(this.form.controls.needsApproval.value), takeUntilDestroyed())
      .subscribe((required) => {
        const note = this.form.controls.approvalNote;
        note.setValidators(
          required
            ? [Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)]
            : [Validators.maxLength(500)],
        );
        note.updateValueAndValidity({ emitEvent: false });
      });
  }

  submit(): void {
    if (this.saving() || this.form.pending) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saveRequested.emit({
      name: value.name.trim(),
      needsApproval: value.needsApproval,
      approvalNote: value.needsApproval ? value.approvalNote.trim() : null,
    });
  }
}
