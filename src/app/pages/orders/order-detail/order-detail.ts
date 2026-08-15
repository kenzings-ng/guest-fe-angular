import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from '../../../components/button/button';
import { OrderDetail } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { PaymentCredentialService } from '../../../services/payment-credential.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, DatePipe, Button, ReactiveFormsModule],
  templateUrl: './order-detail.html',
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly paymentCredentials = inject(PaymentCredentialService);

  private orderId = '';

  protected readonly order = signal<OrderDetail | undefined>(undefined);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly cancelError = signal<string | null>(null);
  protected readonly refreshingPayment = signal(false);
  protected readonly paymentError = signal<string | null>(null);
  protected readonly retryingPayment = signal(false);
  protected readonly retryFormOpen = signal(false);
  protected readonly retryCredentials = signal<import('../../../models/payment-credential.model').PaymentCredential[]>([]);
  protected readonly retryForm = this.formBuilder.nonNullable.group({
    cardNumber: ['', Validators.required],
    cardHolderName: ['', Validators.required],
    expiryMonth: ['', Validators.required],
    expiryYear: ['', Validators.required],
    cvv: ['', Validators.required],
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.orderId = params.get('id') ?? '';
      this.fetchOrder();
    });
  }

  protected cancelOrder(): void {
    this.cancelling.set(true);
    this.cancelError.set(null);
    this.orderService.cancel(this.orderId).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.fetchOrder();
      },
      error: (err) => {
        this.cancelling.set(false);
        this.cancelError.set(err?.error?.message ?? 'Could not cancel this order.');
      },
    });
  }

  protected refreshPaymentStatus(): void {
    this.refreshingPayment.set(true);
    this.paymentError.set(null);
    this.orderService.refreshPaymentStatus(this.orderId).subscribe({
      next: () => {
        this.refreshingPayment.set(false);
        this.fetchOrder();
      },
      error: (error: { error?: { message?: string } }) => {
        this.refreshingPayment.set(false);
        this.paymentError.set(error.error?.message ?? 'Could not refresh the payment status.');
      },
    });
  }

  protected hasPendingOnlinePayment(order: OrderDetail): boolean {
    return order.transactions.some(
      (transaction) =>
        transaction.type === 'payment' &&
        transaction.status === 'pending' &&
        transaction.provider !== undefined,
    );
  }

  protected hasFailedOnlinePayment(order: OrderDetail): boolean {
    const latestOnlinePayment = order.transactions
      .filter((transaction) => transaction.type === 'payment' && transaction.provider)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return latestOnlinePayment?.status === 'failed';
  }

  protected startPaymentRetry(): void {
    this.paymentError.set(null);
    this.paymentCredentials.available().subscribe({
      next: (credentials) => {
        this.retryCredentials.set(credentials.filter((item) => item.provider === 'comesh' && item.paymentMethods.includes('card')));
        this.retryFormOpen.set(true);
      },
      error: () => this.paymentError.set('Could not load payment providers.'),
    });
  }

  protected retryPayment(): void {
    if (this.retryForm.invalid) {
      this.retryForm.markAllAsTouched();
      return;
    }
    const credential = this.retryCredentials()[0];
    if (!credential) {
      this.paymentError.set('No online payment provider is available.');
      return;
    }
    const raw = this.retryForm.getRawValue();
    this.retryingPayment.set(true);
    this.orderService.retryPayment(this.orderId, {
      provider: credential.provider,
      environment: credential.environment,
      paymentMethod: 'card',
      source: { type: 'card', card: { number: raw.cardNumber.replace(/\s/g, ''), holderName: raw.cardHolderName.trim(), expiryMonth: raw.expiryMonth.padStart(2, '0'), expiryYear: raw.expiryYear.trim(), cvv: raw.cvv.trim() } },
      browser: { userAgent: navigator.userAgent, acceptLanguage: navigator.language, screenWidth: window.screen.width, screenHeight: window.screen.height, timeZoneOffset: new Date().getTimezoneOffset() },
      billingAddress: { name: raw.cardHolderName.trim(), line1: this.order()?.shippingAddress || 'N/A', city: 'N/A', country: 'US' },
      returnUrl: `${window.location.origin}/payment/confirmation`,
    }).subscribe({
      next: (result) => {
        this.retryingPayment.set(false);
        this.retryFormOpen.set(false);
        const action = result.payment?.nextAction;
        if (action?.redirectUrl) window.location.assign(action.redirectUrl);
        else if (action?.html) { document.open(); document.write(action.html); document.close(); }
        else this.fetchOrder();
      },
      error: (error: { error?: { message?: string } }) => {
        this.retryingPayment.set(false);
        this.paymentError.set(error.error?.message ?? 'Could not retry payment.');
      },
    });
  }

  private fetchOrder(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.orderService.getOne(this.orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load this order.');
        this.loading.set(false);
      },
    });
  }
}
