export type PaymentMethodId = 'razorpay' | 'partial_cod'

export interface PaymentMethod {
  readonly id: PaymentMethodId
  readonly label: string
  readonly description: string
  readonly icon: string
}

export type PaymentStatus = 'idle' | 'verifying' | 'processing' | 'success' | 'error'

export type PaymentPayload =
  | { readonly method: 'razorpay' }
  | { readonly method: 'partial_cod' }

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
  readonly totalAmount: number
}

export interface TrustBadge {
  readonly src: string
  readonly alt: string
  readonly className: string
}
