export type PaymentMethodId = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'

export interface PaymentMethod {
  readonly id: PaymentMethodId
  readonly label: string
  readonly description: string
  readonly icon: string
}

export type PaymentStatus = 'idle' | 'verifying' | 'processing' | 'success' | 'error'

export interface CardFormValues {
  readonly cardNumber: string
  readonly expiryDate: string
  readonly cvv: string
  readonly nameOnCard: string
}

export type PaymentPayload =
  | { readonly method: 'razorpay' }
  | { readonly method: 'upi'; readonly vpaId: string }
  | ({ readonly method: 'card' } & CardFormValues)
  | { readonly method: 'netbanking'; readonly bankId: string }
  | { readonly method: 'wallet'; readonly walletId: string }
  | { readonly method: 'cod' }

export interface OrderLineItem {
  readonly label: string
  readonly value: string
  readonly isFree?: boolean
}

export interface OrderProductPreview {
  readonly collection: string
  readonly name: string
  readonly qty: number
  readonly imageUrl: string
  readonly imageAlt: string
}

export interface PaymentOrderSummary {
  readonly product: OrderProductPreview
  readonly lineItems: ReadonlyArray<OrderLineItem>
  readonly totalLabel: string
  readonly totalValue: string
}

export interface TrustBadge {
  readonly src: string
  readonly alt: string
  readonly className: string
}
