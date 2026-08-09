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

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgOptimizedImage, Button, ProductCard, SectionLabel],
  templateUrl: './home.html',
})
export class Home {
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);

  protected readonly heroImage =
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&h=1250&q=80';
  protected readonly heroAccentImage =
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&h=625&q=80';
  protected readonly approachImage =
    'https://images.unsplash.com/photo-1608234807905-4466023792f5?auto=format&fit=crop&w=800&h=1000&q=80';

  private readonly products = toSignal(this.productService.getAll(), {
    initialValue: [] as Product[],
  });

  protected readonly featured = computed(() => {
    const all = this.products();
    const newArrivals = all.filter((product) => product.isNew);
    return (newArrivals.length ? newArrivals : all).slice(0, 4);
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
