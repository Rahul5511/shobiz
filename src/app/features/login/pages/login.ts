import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthSession } from '../../../core/services/login/auth-session.service';
import { AuthApiError } from '../../../core/models/login/login.models';
import { loginDestination } from '../../../shared/utils/login/login-navigation';
import { DEMO_CREDENTIALS } from '../../../core/services/login/login.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class Login {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');

  protected readonly demoCredentials = DEMO_CREDENTIALS;
  protected readonly passwordVisible = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected useDemoAccount(): void {
    if (this.submitting()) return;
    this.errorMessage.set('');
    this.form.setValue(DEMO_CREDENTIALS);
    this.emailInput()?.nativeElement.focus();
  }

  protected ssoDemo(): void {
    if (this.submitting()) return;
    this.form.setValue({ email: 'accountmanager@demo.local', password: DEMO_CREDENTIALS.password });
    this.submit();
  }

  protected submit(): void {
    if (this.submitting()) return;
    this.errorMessage.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid || this.form.pending) {
      const field = this.form.controls.email.invalid ? this.emailInput() : this.passwordInput();
      field?.nativeElement.focus();
      return;
    }

    const values = this.form.getRawValue();
    this.submitting.set(true);
    this.session
      .login({ email: values.email.trim(), password: values.password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.form.controls.password.reset();
          const destination = loginDestination(
            this.router,
            this.route.snapshot.queryParamMap.get('returnUrl'),
          );
          void this.router.navigateByUrl(destination, { replaceUrl: true }).then(
            (navigated) => {
              if (!navigated)
                this.errorMessage.set('You are signed in. Please try continuing again.');
              this.submitting.set(false);
            },
            () => {
              this.errorMessage.set('Your workspace could not open. Please try signing in again.');
              this.submitting.set(false);
            },
          );
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof AuthApiError && error.code === 'invalid-credentials'
              ? 'The email or password is incorrect. Check your details and try again.'
              : 'We could not sign you in right now. Please try again.',
          );
          this.submitting.set(false);
        },
      });
  }
}
