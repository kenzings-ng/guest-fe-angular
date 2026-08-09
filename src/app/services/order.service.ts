import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderDetail, OrderItem, OrderPromotion } from '../models/order.model';
import { PaymentMethod, Transaction } from '../models/transaction.model';

interface ApiTransaction {
  _id: string;
  orderId: string;
  type: Transaction['type'];
  status: Transaction['status'];
  method: Transaction['method'];
  amount: number;
  reference: string;
  note?: string;
  createdAt: string;
}

interface ApiOrder {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promotion?: OrderPromotion;
  totalPrice: number;
  status: Order['status'];
  shippingAddress?: string;
  createdAt: string;
  transactions?: ApiTransaction[];
}

function mapTransaction(api: ApiTransaction): Transaction {
  return {
    id: api._id,
    orderId: api.orderId,
    type: api.type,
    status: api.status,
    method: api.method,
    amount: api.amount,
    reference: api.reference,
    note: api.note,
    createdAt: api.createdAt,
  };
}

function mapOrder(api: ApiOrder): Order {
  return {
    id: api._id,
    items: api.items,
    subtotal: api.subtotal,
    discount: api.discount,
    promotion: api.promotion,
    totalPrice: api.totalPrice,
    status: api.status,
    shippingAddress: api.shippingAddress,
    createdAt: api.createdAt,
  };
}

function mapOrderDetail(api: ApiOrder): OrderDetail {
  return {
    ...mapOrder(api),
    transactions: (api.transactions ?? []).map(mapTransaction),
  };
}

export interface CheckoutInput {
  shippingAddress?: string;
  promotionCode?: string;
  paymentMethod?: PaymentMethod;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  checkout(input: CheckoutInput): Observable<Order> {
    return this.http.post<ApiOrder>(`${this.baseUrl}/checkout`, input).pipe(map(mapOrder));
  }

  getMine(): Observable<Order[]> {
    return this.http.get<ApiOrder[]>(this.baseUrl).pipe(map((list) => list.map(mapOrder)));
  }

  getOne(id: string): Observable<OrderDetail> {
    return this.http.get<ApiOrder>(`${this.baseUrl}/${id}`).pipe(map(mapOrderDetail));
  }

  cancel(id: string): Observable<Order> {
    return this.http.post<ApiOrder>(`${this.baseUrl}/${id}/cancel`, {}).pipe(map(mapOrder));
  }
}
