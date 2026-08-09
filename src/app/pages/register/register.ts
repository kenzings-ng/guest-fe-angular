import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Button],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly redirectTo = this.route.snapshot.queryParamMap.get('redirect');
  protected readonly loginQueryParams = this.redirectTo ? { redirect: this.redirectTo } : {};

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);
    this.auth.register(email, password, name).subscribe({
      next: () => this.navigateAfterAuth(),
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err?.status === 409
            ? 'An account with this email already exists.'
            : 'Something went wrong. Please try again.',
        );
      },
    });
  }

  private navigateAfterAuth(): void {
    const target = this.redirectTo?.startsWith('/') ? this.redirectTo : '/';
    this.router.navigateByUrl(target);
  }
}
