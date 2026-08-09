import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CartDrawer],
  templateUrl: './app.html',
})
export class App {}
