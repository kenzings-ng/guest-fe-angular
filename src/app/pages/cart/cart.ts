import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { CartItem } from '../../models/cart-item.model';
import { CartStore } from '../../services/cart.store';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, NgOptimizedImage, Button],
  templateUrl: './cart.html',
})
export class Cart {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  protected readonly cart = inject(CartStore);

  protected readonly shippingAddress = signal('');
  protected readonly placingOrder = signal(false);
  protected readonly checkoutError = signal<string | null>(null);

  protected lineKey(item: CartItem): string {
    return `${item.productId}__${item.color}__${item.size}`;
  }

  protected setQuantity(item: CartItem, quantity: number): void {
    this.cart.updateQuantity(item, quantity);
  }

  protected remove(item: CartItem): void {
    this.cart.remove(item);
  }

  protected onAddressInput(value: string): void {
    this.shippingAddress.set(value);
  }

  protected placeOrder(): void {
    this.placingOrder.set(true);
    this.checkoutError.set(null);
    this.orderService.checkout({ shippingAddress: this.shippingAddress().trim() || undefined }).subscribe({
      next: (order) => {
        this.placingOrder.set(false);
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        this.placingOrder.set(false);
        this.checkoutError.set(err?.error?.message ?? 'Could not place your order.');
      },
    });
  }
}
