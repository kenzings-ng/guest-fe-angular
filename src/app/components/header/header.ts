import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartStore } from '../../services/cart.store';
import { WishlistStore } from '../../services/wishlist.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  host: {
    '(document:keydown.escape)': 'mobileMenuOpen.set(false); accountMenuOpen.set(false)',
  },
})
export class Header {
  protected readonly cart = inject(CartStore);
  protected readonly auth = inject(AuthService);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly accountMenuOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected toggleAccountMenu(): void {
    this.accountMenuOpen.update((value) => !value);
  }

  protected closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  protected signOut(): void {
    this.accountMenuOpen.set(false);
    this.auth.logout();
  }
}
