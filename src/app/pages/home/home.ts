import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { ProductCard } from '../../components/product-card/product-card';
import { SectionLabel } from '../../components/section-label/section-label';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CartStore } from '../../services/cart.store';
import { ProductService } from '../../services/product.service';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgOptimizedImage, Button, ProductCard, SectionLabel],
  templateUrl: './home.html',
})
export class Home {
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly articleService = inject(ArticleService);

  protected readonly articles = toSignal(this.articleService.getAll(3), {
    initialValue: [] as Article[],
  });

  protected readonly heroImage =
    'https://images.unsplash.com/photo-1608234807905-4466023792f5?auto=format&fit=crop&w=1200&h=1500&q=85';
  protected readonly heroAccentImage =
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&h=625&q=80';
  protected readonly approachImage =
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&h=1125&q=80';

  private readonly products = toSignal(this.productService.getAll(), {
    initialValue: [] as Product[],
  });

  protected readonly featured = computed(() => {
    const all = this.products();
    const newArrivals = all.filter((product) => product.isNew);
    const remaining = all.filter((product) => !newArrivals.some((item) => item.id === product.id));
    return [...newArrivals, ...remaining].slice(0, 4);
  });

  protected addFirstAvailable(product: Product): void {
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
