import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { Checkout, CHECKOUT_STATE_KEY } from './checkout';

@Component({
  selector: 'app-checkout-payment',
  imports: [RouterLink, ReactiveFormsModule, Button],
  templateUrl: './payment.html',
})
export class CheckoutPayment extends Checkout {
  protected readonly editingBilling = signal(false);
  constructor() {
    super();
    const stored = sessionStorage.getItem(CHECKOUT_STATE_KEY);
    if (stored) {
      try {
        const state = JSON.parse(stored) as ReturnType<typeof this.checkoutForm.getRawValue> & { paymentId?: string };
        this.checkoutForm.patchValue(state);
        if (state.paymentId) this.selectPayment(state.paymentId);
      } catch {
        sessionStorage.removeItem(CHECKOUT_STATE_KEY);
      }
    }
  }

  protected billingComplete(): boolean {
    const value = this.checkoutForm.getRawValue();
    return [value.firstName, value.lastName, value.billingLine1, value.billingCity, value.billingCountry]
      .every((item) => item.trim().length > 0);
  }

  protected editBilling(): void {
    this.editingBilling.set(true);
  }

  protected saveBilling(): void {
    if (this.billingComplete()) this.editingBilling.set(false);
  }
}
