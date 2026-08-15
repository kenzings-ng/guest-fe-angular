import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { WishlistStore } from '../../services/wishlist.store';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgOptimizedImage, ImageUrlPipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  protected readonly wishlist = inject(WishlistStore);

  readonly product = input.required<Product>();
  readonly priority = input(false);

  readonly quickAdd = output<Product>();

  protected readonly hasSecondImage = computed(() => this.product().images.length > 1);
  protected readonly saved = computed(() => this.wishlist.has(this.product().id));

  protected onQuickAdd(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickAdd.emit(this.product());
  }

  protected onToggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(this.product().id);
  }
}
