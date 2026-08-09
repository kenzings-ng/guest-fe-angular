import { NgOptimizedImage } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../models/cart-item.model';
import { CartStore } from '../../services/cart.store';
import { Button } from '../button/button';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, NgOptimizedImage, Button],
  templateUrl: './cart-drawer.html',
  host: {
    '(document:keydown.escape)': 'cart.close()',
  },
})
export class CartDrawer {
  protected readonly cart = inject(CartStore);

  constructor() {
    effect(() => {
      document.body.style.overflow = this.cart.isOpen() ? 'hidden' : '';
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
}
