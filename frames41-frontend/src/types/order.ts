export interface OrderItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly priceInr: number
  readonly quantity: number
  readonly imageUrl: string
  readonly imageAlt: string
}

export type ShippingCost = number | 'complimentary'

export interface OrderDetails {
  readonly orderNumber: string
  readonly estimatedDelivery: string
  readonly shippingMethod: string
  readonly subtotalInr: number
  readonly shippingCostInr: ShippingCost
  readonly totalInr: number
  readonly items: ReadonlyArray<OrderItem>
}

export type OrderStepStatus = 'complete' | 'active' | 'pending'

export interface OrderStep {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly status: OrderStepStatus
}

export interface RecommendedProduct {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly subtitle: string
  readonly priceInr: number
  readonly imageUrl: string
  readonly imageAlt: string
}
