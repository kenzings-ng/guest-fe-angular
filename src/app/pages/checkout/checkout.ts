import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { Cart } from '../cart/cart';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

export const CHECKOUT_STATE_KEY = 'maison-checkout-state';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, ReactiveFormsModule, Button],
  templateUrl: './checkout.html',
})
export class Checkout extends Cart {
  private readonly checkoutRouter = inject(Router);
  private readonly users = inject(UserService);

  constructor() {
    super();
    this.users.getMyProfile().subscribe({
      next: (profile) => {
        // A payment-page reload already has the checkout snapshot. Do not let
        // the asynchronous profile response overwrite it and cause the
        // BillingInfo panel to flicker or collapse unexpectedly.
        if (sessionStorage.getItem(CHECKOUT_STATE_KEY)) return;
        const address = profile.profile.address;
        if (address) {
          this.checkoutForm.patchValue({
            firstName: profile.name.trim().split(/\s+/)[0] ?? '',
            lastName: profile.name.trim().split(/\s+/).slice(1).join(' '),
            billingLine1: address.line1 ?? '',
            billingCity: address.city ?? '',
            billingCountry: address.country ?? 'US',
          });
        }
      },
      error: () => undefined,
    });
  }

  protected handleSubmit(): void {
    if (this.isOnlinePayment()) {
      this.continueToPayment();
    } else {
      this.placeOrder();
    }
  }

  protected continueToPayment(): void {
    const cardControls = [this.checkoutForm.controls.cardNumber, this.checkoutForm.controls.expiryMonth, this.checkoutForm.controls.expiryYear, this.checkoutForm.controls.cvv];
    cardControls.forEach((control) => { control.clearValidators(); control.updateValueAndValidity({ emitEvent: false }); });
    const values = this.checkoutForm.getRawValue();
    const missingBilling = [
      values.shippingAddress,
      values.firstName,
      values.lastName,
      values.billingLine1,
      values.billingCity,
      values.billingCountry,
    ].some((value) => !value.trim());
    if (missingBilling) {
      this.checkoutForm.markAllAsTouched();
      this.checkoutError.set('Please complete your billing and delivery information first.');
      return;
    }
    const token = this.createPaymentToken();
    sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify({
      ...this.checkoutForm.getRawValue(),
      paymentId: this.selectedPaymentId(),
      token,
    }));
    const expiresAt = Date.now() + 15 * 60 * 1000;
    void this.checkoutRouter.navigate(['/checkout/payment'], {
      queryParams: { expire_at: new Date(expiresAt).toISOString(), token },
    });
  }

  private createPaymentToken(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}
