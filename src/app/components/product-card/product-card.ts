import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly priority = input(false);

  readonly quickAdd = output<Product>();

  protected readonly hasSecondImage = computed(() => this.product().images.length > 1);

  protected onQuickAdd(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickAdd.emit(this.product());
  }
}
