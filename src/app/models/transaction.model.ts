export type TransactionType = 'payment' | 'refund';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod =
  | 'cod'
  | 'bank_transfer'
  | 'card'
  | 'googlepay'
  | 'applepay'
  | 'wallet'
  | 'qr'
  | 'paypal'
  | 'token';

export interface Transaction {
  id: string;
  orderId: string;
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
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
