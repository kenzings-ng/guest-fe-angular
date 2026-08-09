import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { AuthService } from '../../services/auth.service';

type VerifyStatus = 'loading' | 'success' | 'error';

const AUTO_REDIRECT_SECONDS = 5;

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, Button],
  templateUrl: './verify-email.html',
})
export class VerifyEmail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly status = signal<VerifyStatus>('loading');
  protected readonly message = signal('');
  protected readonly secondsLeft = signal(AUTO_REDIRECT_SECONDS);

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      this.message.set('This verification link is missing a token.');
      this.scheduleAutoRedirect();
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: (res) => {
        this.status.set('success');
        this.message.set(res.message ?? 'Your email has been verified.');
        this.scheduleAutoRedirect();
      },
      error: (err) => {
        this.status.set('error');
        this.message.set(
          err?.error?.message ?? 'This verification link is invalid or has expired.',
        );
        this.scheduleAutoRedirect();
      },
    });
  }

  /** Auto-navigate home if the user doesn't click anything — cancelled on nav away. */
  private scheduleAutoRedirect(): void {
    this.secondsLeft.set(AUTO_REDIRECT_SECONDS);
    const interval = setInterval(() => this.secondsLeft.update((s) => s - 1), 1000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      this.router.navigateByUrl('/');
    }, AUTO_REDIRECT_SECONDS * 1000);

    this.destroyRef.onDestroy(() => {
      clearInterval(interval);
      clearTimeout(timeout);
    });
  }
}
