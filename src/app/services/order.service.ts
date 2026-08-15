import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderDetail, OrderItem, OrderPromotion } from '../models/order.model';
import { PaymentMethod, Transaction } from '../models/transaction.model';
import { GatewayPaymentMethod, PaymentEnvironment } from '../models/payment-credential.model';

interface ApiTransaction {
  _id: string;
  orderId: string;
  type: Transaction['type'];
  status: Transaction['status'];
  method: Transaction['method'];
  amount: number;
  currency?: string;
  reference: string;
  provider?: string;
  providerStatus?: string;
  cardBrand?: string;
  cardLastFour?: string;
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
    currency: api.currency,
    reference: api.reference,
    provider: api.provider,
    providerStatus: api.providerStatus,
    cardBrand: api.cardBrand,
    cardLastFour: api.cardLastFour,
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
  payment?: OnlinePaymentInput;
}

export interface OnlinePaymentInput {
  token?: string;
  provider: string;
  environment: PaymentEnvironment;
  paymentMethod: GatewayPaymentMethod;
  source:
    | { type: 'checkout' }
    | {
        type: 'card';
        card: {
          number: string;
          holderName: string;
          expiryMonth: string;
          expiryYear: string;
          cvv: string;
        };
      };
  browser: {
    userAgent?: string;
    acceptLanguage?: string;
    screenWidth: number;
    screenHeight: number;
    timeZoneOffset: number;
  };
  billingAddress: {
    name: string;
    line1: string;
    city: string;
    country: string;
  };
  returnUrl: string;
}

export interface PaymentNextAction {
  type: 'redirect' | 'html';
  redirectUrl?: string;
  html?: string;
}

export interface CheckoutPayment {
  paymentId?: string;
  merchantOrderNo: string;
  status: string;
  provider: string;
  paymentMethod: string;
  nextAction?: PaymentNextAction;
  code: string;
  message: string;
}

interface ApiCheckoutResult extends ApiOrder {
  payment?: CheckoutPayment;
}

export interface CheckoutResult {
  order: Order;
  payment?: CheckoutPayment;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  checkout(input: CheckoutInput): Observable<CheckoutResult> {
    return this.http
      .post<ApiCheckoutResult>(`${this.baseUrl}/checkout`, input)
      .pipe(map((result) => ({ order: mapOrder(result), payment: result.payment })));
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

  refreshPaymentStatus(id: string): Observable<CheckoutResult> {
    return this.http
      .post<ApiCheckoutResult>(`${this.baseUrl}/${id}/payment-status`, {})
      .pipe(map((result) => ({ order: mapOrder(result), payment: result.payment })));
  }

  retryPayment(id: string, payment: OnlinePaymentInput): Observable<CheckoutResult> {
    return this.http
      .post<ApiCheckoutResult>(`${this.baseUrl}/${id}/payment-retry`, payment)
      .pipe(map((result) => ({ order: mapOrder(result), payment: result.payment })));
  }
}
