export interface CartLineItem {
  readonly id: string
  readonly name: string
  readonly variant: string
  readonly priceInr: number
  readonly imageUrl: string
  readonly imageAlt: string
  readonly quantity: number
  readonly inStock?: boolean
}

export interface CartCharges {
  readonly shippingInr: number
  readonly taxInr: number
  readonly discountInr: number
}

export interface CartData {
  readonly items: ReadonlyArray<CartLineItem>
  readonly charges: CartCharges
}
