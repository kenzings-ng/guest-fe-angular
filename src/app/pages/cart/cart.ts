import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { CartItem } from '../../models/cart-item.model';
import { PaymentCredential } from '../../models/payment-credential.model';
import { AuthService } from '../../services/auth.service';
import { CartStore } from '../../services/cart.store';
import { CheckoutResult, OnlinePaymentInput, OrderService } from '../../services/order.service';
import { PaymentCredentialService } from '../../services/payment-credential.service';

const PENDING_PAYMENT_ORDER_KEY = 'maison-pending-payment-order-id';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, NgOptimizedImage, ReactiveFormsModule, Button],
  templateUrl: './cart.html',
})
export class Cart {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly paymentCredentials = inject(PaymentCredentialService);
  protected readonly cart = inject(CartStore);

  protected readonly checkoutForm = this.formBuilder.nonNullable.group({
    shippingAddress: [''],
    firstName: [''],
    lastName: [''],
    billingLine1: [''],
    billingCity: [''],
    billingCountry: ['US'],
    cardNumber: [''],
    expiryMonth: [''],
    expiryYear: [''],
    cvv: [''],
  });
  protected readonly credentials = signal<PaymentCredential[]>([]);
  protected readonly loadingPayments = signal(true);
  protected readonly paymentLoadError = signal<string | null>(null);
  protected readonly selectedPaymentId = signal('cod');
  protected readonly placingOrder = signal(false);
  protected readonly checkoutError = signal<string | null>(null);

  protected readonly onlineCredentials = computed(() =>
    this.credentials().filter(
      (credential) =>
        credential.provider === 'comesh' && credential.paymentMethods.includes('card'),
    ),
  );
  protected readonly selectedCredential = computed(() =>
    this.onlineCredentials().find((credential) => credential.id === this.selectedPaymentId()),
  );
  protected readonly isOnlinePayment = computed(() => this.selectedCredential() !== undefined);

  constructor() {
    this.paymentCredentials.available().subscribe({
      next: (credentials) => {
        this.credentials.set(credentials);
        this.loadingPayments.set(false);
      },
      error: () => {
        // COD remains available when checkout capability cannot be loaded.
        this.loadingPayments.set(false);
        this.paymentLoadError.set(
          'Online payment is temporarily unavailable. You can still pay on delivery.',
        );
      },
    });
  }

  protected lineKey(item: CartItem): string {
    return `${item.productId}__${item.color}__${item.size}`;
  }

  protected setQuantity(item: CartItem, quantity: number): void {
    this.cart.updateQuantity(item, quantity);
  }

  protected remove(item: CartItem): void {
    this.cart.remove(item);
  }

  protected selectPayment(id: string): void {
    this.selectedPaymentId.set(id);
    this.checkoutError.set(null);
    this.updateBillingValidators();
  }

  protected placeOrder(): void {
    if (!this.auth.requireAuth()) {
      return;
    }
    this.updateBillingValidators();
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const onlineCredential = this.selectedCredential();
    this.placingOrder.set(true);
    this.checkoutError.set(null);
    const raw = this.checkoutForm.getRawValue();
    const payment = onlineCredential ? this.buildOnlinePayment(onlineCredential, raw) : undefined;
    this.orderService
      .checkout({
        shippingAddress: raw.shippingAddress.trim() || undefined,
        payment,
      })
      .subscribe({
        next: (result) => this.handleCheckoutResult(result),
        error: (error: { error?: { message?: string } }) => {
          this.placingOrder.set(false);
          this.checkoutError.set(error.error?.message ?? 'Could not place your order.');
        },
      });
  }

  protected showBillingError(
    field:
      | 'firstName'
      | 'lastName'
      | 'billingLine1'
      | 'billingCity'
      | 'billingCountry'
      | 'cardNumber'
      | 'expiryMonth'
      | 'expiryYear'
      | 'cvv',
  ): boolean {
    const control = this.checkoutForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  private updateBillingValidators(): void {
    const requiredOnline = this.isOnlinePayment();
    const controls = [
      this.checkoutForm.controls.firstName,
      this.checkoutForm.controls.lastName,
      this.checkoutForm.controls.billingLine1,
      this.checkoutForm.controls.billingCity,
      this.checkoutForm.controls.billingCountry,
    ];
    for (const control of controls) {
      control.setValidators(requiredOnline ? [Validators.required] : []);
      control.updateValueAndValidity({ emitEvent: false });
    }
    const cardControls = [
      this.checkoutForm.controls.cardNumber,
      this.checkoutForm.controls.expiryMonth,
      this.checkoutForm.controls.expiryYear,
      this.checkoutForm.controls.cvv,
    ];
    for (const control of cardControls) {
      control.setValidators(requiredOnline ? [Validators.required] : []);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private buildOnlinePayment(
    credential: PaymentCredential,
    raw: ReturnType<typeof this.checkoutForm.getRawValue>,
  ): OnlinePaymentInput {
    let token: string | undefined;
    try {
      const stored = sessionStorage.getItem('maison-checkout-state');
      token = stored ? (JSON.parse(stored) as { token?: string }).token : undefined;
    } catch {
      token = undefined;
    }
    return {
      token,
      provider: credential.provider,
      environment: credential.environment,
      paymentMethod: 'card',
      browser: {
        userAgent: navigator.userAgent,
        acceptLanguage: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timeZoneOffset: new Date().getTimezoneOffset(),
      },
      billingAddress: {
          name: `${raw.firstName.trim()} ${raw.lastName.trim()}`.trim(),
        line1: raw.billingLine1.trim(),
        city: raw.billingCity.trim(),
        country: raw.billingCountry.trim().toUpperCase(),
      },
      source: {
        type: 'card',
        card: {
          number: raw.cardNumber.replace(/\s/g, ''),
          holderName: `${raw.firstName.trim()} ${raw.lastName.trim()}`.trim(),
          expiryMonth: raw.expiryMonth.padStart(2, '0'),
          expiryYear: raw.expiryYear.trim(),
          cvv: raw.cvv.trim(),
        },
      },
      returnUrl: `${window.location.origin}/payment/confirmation`,
    };
  }

  private handleCheckoutResult(result: CheckoutResult): void {
    this.placingOrder.set(false);
    this.cart.refresh().subscribe({ error: () => undefined });
    const action = result.payment?.nextAction;
    if (!action) {
      void this.router.navigate(['/orders', result.order.id]);
      return;
    }

    sessionStorage.setItem(PENDING_PAYMENT_ORDER_KEY, result.order.id);
    if (action.type === 'redirect' && action.redirectUrl) {
      window.location.assign(action.redirectUrl);
      return;
    }
    if (action.type === 'html' && action.html) {
      // ComesH instructs merchants to render this provider-supplied action.
      // It is used only for the signed response returned by our backend.
      document.open();
      document.write(action.html);
      document.close();
      return;
    }

    this.checkoutError.set('The payment gateway did not provide an action to continue checkout.');
  }
}
