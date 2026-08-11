import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Maison — Considered Clothing',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'Our Story — Maison',
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
    title: 'Shop All — Maison',
  },
  {
    path: 'products/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
    title: 'Maison',
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
    title: 'Your Bag — Maison',
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then((m) => m.Wishlist),
    title: 'Your Wishlist — Maison',
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then((m) => m.Search),
    title: 'Search — Maison',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Sign In — Maison',
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
    title: 'Create an Account — Maison',
  },
  {
    path: 'size-guide',
    loadComponent: () => import('./pages/size-guide/size-guide').then((m) => m.SizeGuidePage),
    title: 'Size Guide — Maison',
  },
  {
    path: 'shipping-returns',
    loadComponent: () =>
      import('./pages/shipping-returns/shipping-returns').then((m) => m.ShippingReturns),
    title: 'Shipping & Returns — Maison',
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq').then((m) => m.Faq),
    title: 'FAQ — Maison',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Contact — Maison',
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email').then((m) => m.VerifyEmail),
    title: 'Verify Email — Maison',
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
    title: 'My Account — Maison',
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
    title: 'My Orders — Maison',
    canActivate: [authGuard],
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./pages/orders/order-detail/order-detail').then((m) => m.OrderDetailPage),
    title: 'Order Detail — Maison',
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
