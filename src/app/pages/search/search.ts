import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { CartStore } from '../../services/cart.store';
import { ProductService, ProductQuery } from '../../services/product.service';
import { Subject, debounceTime, switchMap, distinctUntilChanged, of } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [ProductCard],
  templateUrl: './search.html',
})
export class Search {
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);

  protected readonly query = signal('');
  protected readonly results = signal<Product[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(false);

  private searchChange$ = new Subject<void>();
  private searchInput$ = new Subject<string>();

  constructor() {
    this.searchChange$.pipe(
      switchMap(() => {
        if (!this.query().trim()) {
          return of({ items: [], total: 0, page: 1, limit: 12, totalPages: 1 });
        }
        this.loading.set(true);
        const queryParams: ProductQuery = {
          search: this.query().trim(),
          page: this.page(),
          limit: 12
        };
        return this.productService.search(queryParams);
      })
    ).subscribe(result => {
      this.results.set(result.items);
      this.total.set(result.total);
      this.page.set(result.page);
      this.totalPages.set(result.totalPages);
      this.loading.set(false);
    });

    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => {
      this.query.set(val);
      this.page.set(1);
      this.searchChange$.next();
    });
  }

  protected onQueryInput(value: string): void {
    this.searchInput$.next(value);
  }

  protected prevPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.searchChange$.next();
    }
  }

  protected nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.searchChange$.next();
    }
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
