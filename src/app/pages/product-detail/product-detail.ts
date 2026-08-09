import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';
import { Button } from '../../components/button/button';
import { ProductCard } from '../../components/product-card/product-card';
import { SectionLabel } from '../../components/section-label/section-label';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { AddCartItemInput, CartStore } from '../../services/cart.store';
import { getRelatedProducts, ProductService } from '../../services/product.service';
import { AccordionItem } from './accordion-item/accordion-item';
import { Gallery } from './gallery/gallery';
import { SizeSelector } from './size-selector/size-selector';

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface ProductLookup {
  loading: boolean;
  product: Product | undefined;
}

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, Button, ProductCard, SectionLabel, Gallery, SizeSelector, AccordionItem],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly titleService = inject(Title);
  private readonly productService = inject(ProductService);

  private readonly productLookup = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) =>
        this.productService
          .getBySlug(params.get('slug') ?? '')
          .pipe(map((product): ProductLookup => ({ loading: false, product }))),
      ),
      startWith<ProductLookup>({ loading: true, product: undefined }),
    ),
    { initialValue: { loading: true, product: undefined } },
  );

  protected readonly productLoading = computed(() => this.productLookup().loading);
  protected readonly product = computed(() => this.productLookup().product);

  private readonly allProducts = toSignal(this.productService.getAll(), {
    initialValue: [] as Product[],
  });

  protected readonly related = computed(() => {
    const product = this.product();
    return product ? getRelatedProducts(this.allProducts(), product) : [];
  });

  protected readonly isApparelSizing = computed(() =>
    this.product()?.sizes.some((size) => APPAREL_SIZES.includes(size)) ?? false,
  );

  protected readonly selectedColor = signal<string | null>(null);
  protected readonly selectedSize = signal<string | null>(null);
  protected readonly quantity = signal(1);
  protected readonly sizeError = signal(false);
  protected readonly sizeGuideOpen = signal(false);
  protected readonly justAdded = signal(false);

  constructor() {
    effect(() => {
      const product = this.product();
      if (!product) return;
      this.titleService.setTitle(`${product.name} — Maison`);
      this.selectedColor.set(product.colors[0]?.name ?? null);
      this.selectedSize.set(product.sizes.length === 1 ? product.sizes[0] : null);
      this.quantity.set(1);
      this.sizeError.set(false);
      this.justAdded.set(false);
    });
  }

  protected setQuantity(quantity: number): void {
    this.quantity.set(Math.max(1, quantity));
  }

  protected openSizeGuide(): void {
    this.sizeGuideOpen.set(true);
  }

  protected addToCart(product: Product): void {
    if (!this.validateSize(product) || !this.auth.requireAuth()) return;
    this.sizeError.set(false);
    this.cart.add(this.buildCartInput(product)).subscribe(() => this.justAdded.set(true));
  }

  protected buyNow(product: Product): void {
    if (!this.validateSize(product) || !this.auth.requireAuth()) return;
    this.sizeError.set(false);
    this.cart.add(this.buildCartInput(product)).subscribe(() => {
      this.cart.close();
      this.router.navigateByUrl('/cart');
    });
  }

  protected onRelatedQuickAdd(product: Product): void {
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

  private validateSize(product: Product): boolean {
    if (product.sizes.length > 1 && !this.selectedSize()) {
      this.sizeError.set(true);
      return false;
    }
    return true;
  }

  private buildCartInput(product: Product): AddCartItemInput {
    return {
      productId: product.id,
      color: this.selectedColor() ?? product.colors[0]?.name ?? '',
      size: this.selectedSize() ?? product.sizes[0] ?? '',
      quantity: this.quantity(),
    };
  }
}
