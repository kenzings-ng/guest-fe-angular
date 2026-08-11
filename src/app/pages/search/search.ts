import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { CartStore } from '../../services/cart.store';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-search',
  imports: [ProductCard],
  templateUrl: './search.html',
})
export class Search {
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);

  private readonly products = toSignal(this.productService.getAll(), {
    initialValue: [] as Product[],
  });

  protected readonly query = signal('');

  protected readonly results = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) return [];
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term),
    );
  });

  protected onQueryInput(value: string): void {
    this.query.set(value);
  }

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
