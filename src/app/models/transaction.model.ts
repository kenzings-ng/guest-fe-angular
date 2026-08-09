export type TransactionType = 'payment' | 'refund';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod = 'cod' | 'bank_transfer';

export interface Transaction {
  id: string;
  orderId: string;
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
  amount: number;
  reference: string;
  note?: string;
  createdAt: string;
}
