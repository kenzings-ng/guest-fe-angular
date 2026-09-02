import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartStore } from '../../services/cart.store';
import { CartDrawer } from './cart-drawer';

describe('CartDrawer', () => {
  let fixture: ComponentFixture<CartDrawer>;
  const isOpen = signal(false);
  const cart = {
    isOpen: isOpen.asReadonly(),
    items: signal([]).asReadonly(),
    subtotal: signal(0).asReadonly(),
    close: () => isOpen.set(false),
    updateQuantity: () => undefined,
    remove: () => undefined,
  };

  beforeEach(async () => {
    isOpen.set(false);
    await TestBed.configureTestingModule({
      imports: [CartDrawer],
      providers: [provideRouter([]), { provide: CartStore, useValue: cart }],
    }).compileComponents();
    fixture = TestBed.createComponent(CartDrawer);
    fixture.detectChanges();
  });

  it('removes the closed drawer from keyboard and accessibility navigation', () => {
    const drawer = fixture.nativeElement.querySelector('aside') as HTMLElement;

    expect(drawer.hasAttribute('inert')).toBe(true);
    expect(drawer.getAttribute('aria-hidden')).toBe('true');

    isOpen.set(true);
    fixture.detectChanges();

    expect(drawer.hasAttribute('inert')).toBe(false);
    expect(drawer.hasAttribute('aria-hidden')).toBe(false);
  });
});
