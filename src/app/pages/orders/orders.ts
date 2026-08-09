import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../components/button/button';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, DatePipe, Button],
  templateUrl: './orders.html',
})
export class Orders {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.orderService.getMine().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your orders.');
        this.loading.set(false);
      },
    });
  }
}
