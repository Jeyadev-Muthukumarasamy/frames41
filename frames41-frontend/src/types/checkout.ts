export interface ShippingAddress {
  readonly id: string
  readonly label: string
  readonly fullName: string
  readonly line1: string
  readonly line2?: string
  readonly city: string
  readonly state: string
  readonly zip: string
  readonly country: string
}

export interface DeliveryMethod {
  readonly id: string
  readonly name: string
  readonly duration: string
  readonly priceInr: number | null
}

export interface CheckoutLineItem {
  readonly id: string
  readonly name: string
  readonly variant: string
  readonly priceInr: number
  readonly imageUrl: string
  readonly imageAlt: string
}

export interface CheckoutTotals {
  readonly subtotalInr: number
  readonly taxInr: number
  readonly shippingInr: number
  readonly discountInr: number
  readonly totalInr: number
}

export interface CheckoutData {
  readonly addresses: ReadonlyArray<ShippingAddress>
  readonly deliveryMethods: ReadonlyArray<DeliveryMethod>
  readonly lineItems: ReadonlyArray<CheckoutLineItem>
  readonly totals: CheckoutTotals
}
