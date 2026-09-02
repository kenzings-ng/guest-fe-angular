import { Component, computed, inject, input } from '@angular/core';
import { WishlistStore } from '../../services/wishlist.store';

export type WishlistToggleVariant = 'card' | 'detail';

const VARIANT_BASE_CLASS: Record<WishlistToggleVariant, string> = {
  card: 'flex h-11 w-11 items-center justify-center border border-foreground/25 bg-background/95 text-foreground hover:border-accent hover:text-accent',
  detail:
    'flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-md border border-border transition-colors duration-150 ease-out hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
};

// product-card leaves its always-on hover/text classes in place and merely adds
// `text-accent` on top when saved; product-detail swaps the whole class instead.
const VARIANT_UNSAVED_CLASS: Record<WishlistToggleVariant, string> = {
  card: '',
  detail: 'text-foreground hover:text-accent',
};

const VARIANT_STROKE_WIDTH: Record<WishlistToggleVariant, string> = {
  card: '1.6',
  detail: '1.5',
};

@Component({
  selector: 'app-wishlist-toggle',
  host: { class: 'contents' },
  templateUrl: './wishlist-toggle.html',
})
export class WishlistToggle {
  private readonly wishlist = inject(WishlistStore);

  readonly productId = input.required<string>();
  readonly productName = input.required<string>();
  readonly iconSize = input<number>(18);
  readonly variant = input<WishlistToggleVariant>('detail');

  protected readonly saved = computed(() => this.wishlist.has(this.productId()));
  protected readonly strokeWidth = computed(() => VARIANT_STROKE_WIDTH[this.variant()]);
  protected readonly strokeLinejoin = computed(() => (this.variant() === 'detail' ? 'round' : null));

  protected classes(): string {
    const variant = this.variant();
    return `${VARIANT_BASE_CLASS[variant]} ${this.saved() ? 'text-accent' : VARIANT_UNSAVED_CLASS[variant]}`;
  }

  protected ariaLabel(): string {
    const name = this.productName();
    return this.saved() ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`;
  }

  protected onToggle(event: Event): void {
    // Some call sites nest this button inside a routerLink anchor (product-card);
    // stop the click from also triggering navigation.
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(this.productId());
  }
}
