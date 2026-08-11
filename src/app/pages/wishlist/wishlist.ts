import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../components/button/button';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { CartStore } from '../../services/cart.store';
import { ProductService } from '../../services/product.service';
import { WishlistStore } from '../../services/wishlist.store';

@Component({
  selector: 'app-wishlist',
  imports: [Button, ProductCard],
  templateUrl: './wishlist.html',
})
export class Wishlist {
  private readonly wishlist = inject(WishlistStore);
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);

  private readonly products = toSignal(this.productService.getAll(), {
    initialValue: [] as Product[],
  });

  protected readonly savedProducts = computed(() => {
    const ids = new Set(this.wishlist.ids());
    return this.products().filter((product) => ids.has(product.id));
  });

  protected onQuickAdd(product: Product): void {
    if (!this.auth.requireAuth()) return;
    this.cart
      .add({
        productId: product.id,
        color: product.colors[0]?.name ?? '',
        size: product.sizes[0] ?? '',
        quantity: 1,
      })
      .subscribe();
  }
}
