import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { EmailVerificationBanner } from './components/email-verification-banner/email-verification-banner';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CartDrawer, EmailVerificationBanner],
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthService);

  constructor() {
    this.auth.syncCurrentUser().subscribe({ error: () => undefined });
  }
}
