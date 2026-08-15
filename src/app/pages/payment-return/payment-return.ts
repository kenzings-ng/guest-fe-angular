import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { CheckoutPayment, OrderService } from '../../services/order.service';

const PENDING_PAYMENT_ORDER_KEY = 'maison-pending-payment-order-id';

@Component({
  selector: 'app-payment-return',
  imports: [RouterLink, Button],
  templateUrl: './payment-return.html',
})
export class PaymentReturn {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderService);
  protected readonly orderId =
    this.route.snapshot.queryParamMap.get('orderId') ??
    this.route.snapshot.queryParamMap.get('order_id') ??
    sessionStorage.getItem(PENDING_PAYMENT_ORDER_KEY);

  protected readonly loading = signal(true);
  protected readonly refreshing = signal(false);
  protected readonly payment = signal<CheckoutPayment | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  private pollCount = 0;

  constructor() {
    this.refresh();
  }

  protected refresh(): void {
    if (!this.orderId) {
      this.loading.set(false);
      this.errorMessage.set(
        'We could not identify the order to verify. Please open it from your order history.',
      );
      return;
    }
    this.refreshing.set(true);
    this.errorMessage.set(null);
    this.orders.refreshPaymentStatus(this.orderId).subscribe({
      next: (result) => {
        this.payment.set(result.payment ?? null);
        this.loading.set(false);
        this.refreshing.set(false);
        if (result.payment?.status === 'captured') {
          sessionStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
        } else if (result.payment && !['failed', 'declined', 'cancelled'].includes(result.payment.status) && this.pollCount < 5) {
          this.pollCount += 1;
          window.setTimeout(() => this.refresh(), 2000);
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.refreshing.set(false);
        this.errorMessage.set(
          error.error?.message ?? 'We could not verify the payment yet. Please try again.',
        );
      },
    });
  }

  protected orderLink(): string[] {
    return this.orderId ? ['/orders', this.orderId] : ['/orders'];
  }

  protected statusMessage(payment: CheckoutPayment): string {
    switch (payment.status) {
      case 'captured':
        return 'Your payment was successful and your order is confirmed.';
      case 'declined':
      case 'failed':
      case 'cancelled':
        return 'The payment was not completed. You can return to the order and try again if available.';
      default:
        return 'Your payment is still being confirmed. This page can be refreshed safely.';
    }
  }
}
