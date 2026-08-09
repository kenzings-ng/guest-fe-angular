import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from '../../../components/button/button';
import { OrderDetail } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, DatePipe, Button],
  templateUrl: './order-detail.html',
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  private orderId = '';

  protected readonly order = signal<OrderDetail | undefined>(undefined);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly cancelError = signal<string | null>(null);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.orderId = params.get('id') ?? '';
      this.fetchOrder();
    });
  }

  protected cancelOrder(): void {
    this.cancelling.set(true);
    this.cancelError.set(null);
    this.orderService.cancel(this.orderId).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.fetchOrder();
      },
      error: (err) => {
        this.cancelling.set(false);
        this.cancelError.set(err?.error?.message ?? 'Could not cancel this order.');
      },
    });
  }

  private fetchOrder(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.orderService.getOne(this.orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load this order.');
        this.loading.set(false);
      },
    });
  }
}
