import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

type ResendState = 'idle' | 'sending' | 'sent' | 'error';

const RESEND_COOLDOWN_SECONDS = 30;

@Component({
  selector: 'app-email-verification-banner',
  templateUrl: './email-verification-banner.html',
})
export class EmailVerificationBanner {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly user = this.auth.currentUser;
  protected readonly resendState = signal<ResendState>('idle');
  protected readonly cooldownSeconds = signal(0);
  protected readonly isResendDisabled = computed(
    () => this.resendState() === 'sending' || this.cooldownSeconds() > 0,
  );
  protected readonly actionLabel = computed(() => {
    if (this.resendState() === 'sending') return 'Sending…';
    if (this.cooldownSeconds() > 0) return `Resend in ${this.cooldownSeconds()}s`;
    return 'Resend email';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopCooldown());
  }

  protected resend(): void {
    if (this.isResendDisabled()) return;

    this.resendState.set('sending');
    this.auth.resendVerification().subscribe({
      next: () => {
        this.resendState.set('sent');
        this.startCooldown();
      },
      error: () => this.resendState.set('error'),
    });
  }

  private startCooldown(): void {
    this.stopCooldown();
    this.cooldownSeconds.set(RESEND_COOLDOWN_SECONDS);
    this.cooldownTimer = setInterval(() => {
      const next = this.cooldownSeconds() - 1;
      this.cooldownSeconds.set(Math.max(0, next));
      if (next <= 0) {
        this.stopCooldown();
        this.resendState.set('idle');
      }
    }, 1000);
  }

  private stopCooldown(): void {
    if (this.cooldownTimer !== null) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }
}
