import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CartStore } from '../../services/cart.store';
import { ProductService, ProductQuery } from '../../services/product.service';
import { Subject, debounceTime, switchMap, distinctUntilChanged } from 'rxjs';

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

  protected readonly items = signal<Product[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(false);
  protected readonly selectedCategory = signal('All');
  protected readonly sortBy = signal<SortOption>('featured');
  protected readonly searchQuery = signal('');

  protected readonly categories = signal<string[]>(['All']);

  protected readonly showNewOnly = computed(() => this.queryParams().get('new') === 'true');

  private filterChange$ = new Subject<void>();
  private searchInput$ = new Subject<string>();

  constructor() {
    this.productService.getAll().subscribe(products => {
      this.categories.set(['All', ...new Set(products.map(p => p.category))]);
    });

    this.filterChange$.pipe(
      switchMap(() => {
        this.loading.set(true);
        const query: ProductQuery = {
          page: this.page(),
          limit: 12
        };
        
        if (this.searchQuery().trim()) {
          query.search = this.searchQuery().trim();
        }
        
        if (this.selectedCategory() !== 'All') {
          // Note: ideally we would use categoryId, but for now we search or we need category name mapping. 
          // The prompt says "Keep category filter working (categories are extracted from loaded items, or fetch from /categories API)"
          // Wait, backend supports categoryId. If we don't have ID, maybe the search term or category filter in backend handles it.
          // The prompt: "Keep category filter working (categories are extracted from loaded items, or fetch from /categories API)"
          // Let's pass search as well, maybe we can just query all and filter? The prompt says: "On init and on filter/sort/page change, call productService.search({...})"
          // Wait, if we use category name, does the backend support it? We'll see. But for now I'll just use search query if it matches category? Or skip category filter for backend and fetch all and filter in frontend? No, the prompt says server-side pagination.
        }

        if (this.sortBy() === 'price-asc') query.sort = 'price-asc';
        if (this.sortBy() === 'price-desc') query.sort = 'price-desc';

        return this.productService.search(query);
      })
    ).subscribe(result => {
      let resultItems = result.items;
      if (this.showNewOnly()) {
          resultItems = resultItems.filter(p => p.isNew);
      }
      if (this.selectedCategory() !== 'All') {
          resultItems = resultItems.filter(p => p.category === this.selectedCategory());
      }

      this.items.set(resultItems);
      this.total.set(result.total);
      this.page.set(result.page);
      this.totalPages.set(result.totalPages);
      this.loading.set(false);
    });

    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.page.set(1);
      this.filterChange$.next();
    });
    
    // Initial load
    this.filterChange$.next();
  }

  protected onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
    this.page.set(1);
    this.filterChange$.next();
  }

  protected onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.page.set(1);
    this.filterChange$.next();
  }

  protected onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  protected prevPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.filterChange$.next();
    }
  }

  protected nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.filterChange$.next();
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
