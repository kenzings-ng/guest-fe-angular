import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CartStore } from '../../services/cart.store';
import { ProductService } from '../../services/product.service';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

@Component({
  selector: 'app-catalog',
  imports: [ProductCard],
  templateUrl: './catalog.html',
})
export class Catalog {
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  private readonly products = toSignal(this.productService.getAll(), {
    initialValue: [] as Product[],
  });

  protected readonly categories = computed(() => [
    'All',
    ...new Set(this.products().map((product) => product.category)),
  ]);
  protected readonly selectedCategory = signal('All');
  protected readonly sortBy = signal<SortOption>('featured');

  protected readonly showNewOnly = computed(() => this.queryParams().get('new') === 'true');

  protected readonly visibleProducts = computed(() => {
    let list = this.products();

    if (this.showNewOnly()) {
      list = list.filter((product) => product.isNew);
    }
    if (this.selectedCategory() !== 'All') {
      list = list.filter((product) => product.category === this.selectedCategory());
    }

    if (this.sortBy() === 'price-asc') {
      list = list.slice().sort((a, b) => a.price - b.price);
    } else if (this.sortBy() === 'price-desc') {
      list = list.slice().sort((a, b) => b.price - a.price);
    }

    return list;
  });

  protected onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
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
