import { NgOptimizedImage } from '@angular/common';
import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  imports: [NgOptimizedImage],
  templateUrl: './gallery.html',
})
export class Gallery {
  readonly images = input.required<string[]>();
  readonly productName = input.required<string>();

  protected readonly selectedIndex = signal(0);

  protected select(index: number): void {
    this.selectedIndex.set(index);
  }

  protected onScroll(container: HTMLElement): void {
    const width = container.clientWidth || 1;
    const index = Math.round(container.scrollLeft / width);
    this.selectedIndex.set(index);
  }

  protected scrollTo(container: HTMLElement, index: number): void {
    container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' });
    this.selectedIndex.set(index);
  }
}
