import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'maison-wishlist';

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Saved-for-later products, kept in the browser rather than the account — works for guests too. */
@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly _ids = signal<string[]>(readStoredIds());

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);

  has(productId: string): boolean {
    return this._ids().includes(productId);
  }

  toggle(productId: string): void {
    this._ids.update((ids) =>
      ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._ids()));
  }
}
