import { signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartStore } from '../../services/cart.store';
import { OrderService } from '../../services/order.service';
import { PaymentCredentialService } from '../../services/payment-credential.service';
import { Cart } from './cart';

describe('Cart', () => {
  it('does not request protected payment credentials for a signed-out buyer', () => {
    const available = vi.fn(() => of([]));

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: { isAuthenticated: signal(false) } },
        { provide: Router, useValue: {} },
        { provide: OrderService, useValue: {} },
        { provide: PaymentCredentialService, useValue: { available } },
        { provide: CartStore, useValue: {} },
      ],
    });

    TestBed.runInInjectionContext(() => new Cart());

    expect(available).not.toHaveBeenCalled();
  });
});
