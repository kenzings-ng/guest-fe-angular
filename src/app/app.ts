import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { EmailVerificationBanner } from './components/email-verification-banner/email-verification-banner';
import { AuthService } from './services/auth.service';

const NO_FOOTER_PATHS = new Set(['/login', '/register']);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CartDrawer, EmailVerificationBanner],
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split('?')[0]),
      startWith(this.router.url.split('?')[0]),
    ),
    { initialValue: this.router.url.split('?')[0] },
  );

  protected readonly showFooter = computed(() => !NO_FOOTER_PATHS.has(this.currentPath()));

  constructor() {
    this.auth.syncCurrentUser().subscribe({ error: () => undefined });
  }
}
