import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WishlistStore } from '../../services/wishlist.store';
import { WishlistToggle } from './wishlist-toggle';

describe('WishlistToggle', () => {
  it('toggles the injected store and reflects saved state in aria-pressed and the label', async () => {
    const ids = signal<string[]>([]);
    const store = {
      has: (id: string) => ids().includes(id),
      toggle: (id: string) =>
        ids.update((current) =>
          current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
        ),
    };

    await TestBed.configureTestingModule({
      imports: [WishlistToggle],
      providers: [{ provide: WishlistStore, useValue: store }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WishlistToggle);
    fixture.componentRef.setInput('productId', 'p1');
    fixture.componentRef.setInput('productName', 'Coat');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Save Coat to your wishlist');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Remove Coat from your wishlist');
  });
});
