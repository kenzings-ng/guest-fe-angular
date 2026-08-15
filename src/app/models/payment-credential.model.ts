export type GatewayPaymentMethod =
  'card' | 'googlepay' | 'applepay' | 'bank_transfer' | 'wallet' | 'qr' | 'paypal';

export type CardBrand =
  'visa' | 'mastercard' | 'amex' | 'jcb' | 'discover' | 'diners_club' | 'unionpay';

export type PaymentEnvironment = 'sandbox' | 'production';

/** Safe checkout capability returned by GET /payment-credentials/available. */
export interface PaymentCredential {
  id: string;
  provider: string;
  environment: PaymentEnvironment;
  paymentMethods: GatewayPaymentMethod[];
  cardBrands: CardBrand[];
  currency: string;
  isActive: boolean;
}
