import { Transaction } from './transaction.model';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPromotion {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promotion?: OrderPromotion;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress?: string;
  createdAt: string;
}

export interface OrderDetail extends Order {
  transactions: Transaction[];
}
