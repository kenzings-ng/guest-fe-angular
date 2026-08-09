import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Button],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly redirectTo = this.route.snapshot.queryParamMap.get('redirect');
  protected readonly registerQueryParams = this.redirectTo ? { redirect: this.redirectTo } : {};

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    const { email, password, rememberMe } = this.form.getRawValue();
    this.auth.login(email, password, rememberMe).subscribe({
      next: () => this.navigateAfterAuth(),
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err?.status === 401
            ? 'Incorrect email or password.'
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
