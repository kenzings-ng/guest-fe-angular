import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/cart-item.model';
import { AuthService } from './auth.service';

interface RawCartItem {
  productId: string | null;
  slug?: string;
  name: string;
  price: number;
  image?: string;
  color?: string;
  size?: string;
  quantity: number;
}

interface RawCartView {
  items: RawCartItem[];
}

function toCartItem(raw: RawCartItem): CartItem | null {
  if (!raw.productId) return null;
  return {
    productId: raw.productId,
    slug: raw.slug ?? '',
    name: raw.name,
    price: raw.price,
    image: raw.image ?? '',
    color: raw.color ?? '',
    size: raw.size ?? '',
    quantity: raw.quantity,
  };
}

function toCartItems(view: RawCartView): CartItem[] {
  return view.items.map(toCartItem).filter((item): item is CartItem => item !== null);
}

export interface AddCartItemInput {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/carts`;

  private readonly _items = signal<CartItem[]>([]);
  private readonly _isOpen = signal(false);

  readonly items = this._items.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();

  readonly count = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this._items().reduce((total, item) => total + item.price * item.quantity, 0),
  );

  constructor() {
    // Cart lives server-side per user — reload it whenever auth state flips,
    // and drop it locally on logout (there is no guest cart).
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refresh().subscribe();
      } else {
        this._items.set([]);
      }
    });
  }

  refresh(): Observable<CartItem[]> {
    return this.http
      .get<RawCartView>(this.baseUrl)
      .pipe(map(toCartItems), tap((items) => this._items.set(items)));
  }

  /** Adds a line and opens the drawer. Caller subscribes to react once it lands. */
  add(item: AddCartItemInput): Observable<CartItem[]> {
    return this.http.post<RawCartView>(`${this.baseUrl}/items`, item).pipe(
      map(toCartItems),
      tap((items) => {
        this._items.set(items);
        this._isOpen.set(true);
      }),
    );
  }

  updateQuantity(item: Pick<CartItem, 'productId' | 'color' | 'size'>, quantity: number): void {
    if (quantity <= 0) {
      this.remove(item);
      return;
    }
    this.http
      .patch<RawCartView>(`${this.baseUrl}/items/${item.productId}`, { quantity }, {
        params: this.variantParams(item),
      })
      .pipe(map(toCartItems))
      .subscribe((items) => this._items.set(items));
  }

  remove(item: Pick<CartItem, 'productId' | 'color' | 'size'>): void {
    this.http
      .delete<RawCartView>(`${this.baseUrl}/items/${item.productId}`, {
        params: this.variantParams(item),
      })
      .pipe(map(toCartItems))
      .subscribe((items) => this._items.set(items));
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggle(): void {
    this._isOpen.update((value) => !value);
  }

  private variantParams(item: Pick<CartItem, 'color' | 'size'>): HttpParams {
    let params = new HttpParams();
    if (item.color) params = params.set('color', item.color);
    if (item.size) params = params.set('size', item.size);
    return params;
  }
}
