import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** The supplied recovery journey is simulated and does not change account passwords. */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  host: { class: 'platform-admin' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recovery.html',
  styleUrl: './recovery.css',
})
export class Recovery {
  readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as string;
  private readonly router = inject(Router);
  readonly title =
    this.mode === 'forgot-password'
      ? 'Forgot password'
      : this.mode === 'reset-password'
        ? 'Set a new password'
        : 'Verify email OTP';
  readonly error = signal('');
  readonly message = signal(this.mode === 'verify-email' ? 'Enter demo code 123456.' : '');
  readonly form = inject(FormBuilder).nonNullable.group({
    email: [''],
    password: [''],
    confirmation: [''],
    otp: [''],
  });
  submit(): void {
    const value = this.form.getRawValue();
    this.error.set('');
    if (this.mode === 'forgot-password') {
      const control = this.form.controls.email;
      control.setValidators([Validators.required, Validators.email]);
      control.updateValueAndValidity();
      if (control.invalid) {
        this.error.set('Enter a valid email address.');
        return;
      }
      void this.router.navigateByUrl('/reset-password');
    } else if (this.mode === 'reset-password') {
      if (!value.password) {
        this.error.set('Enter a new password.');
        return;
      }
      if (value.password !== value.confirmation) {
        this.error.set('Passwords do not match.');
        return;
      }
      void this.router.navigateByUrl('/verify-email');
    } else {
      if (value.otp !== '123456') {
        this.error.set('Use demo code 123456.');
        return;
      }
      void this.router.navigateByUrl('/login');
    }
  }
}
