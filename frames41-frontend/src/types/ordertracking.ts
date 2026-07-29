export type TrackingStepStatus = 'complete' | 'active' | 'upcoming'

export interface TrackingStep {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly status: TrackingStepStatus
  readonly timestamp: string
}

export interface ShipmentEvent {
  readonly id: string
  readonly title: string
  readonly location: string
  readonly timestamp: string
  readonly isLatest: boolean
}

export interface TrackingOrderItem {
  readonly id: string
  readonly name: string
  readonly subtitle: string
  readonly size: string
  readonly quantity: number
  readonly priceInr: number
  readonly imageUrl: string
  readonly imageAlt: string
}

export interface DeliveryAddress {
  readonly recipientName: string
  readonly streetLine1: string
  readonly streetLine2: string
  readonly stateAndCountry: string
}

export interface DeliveryContact {
  readonly email: string
  readonly phone: string
}

export interface DeliveryInfo {
  readonly address: DeliveryAddress
  readonly contact: DeliveryContact
  readonly estimatedDelivery: string
}

export interface TrackingTotals {
  readonly subtotalInr: number
  readonly shippingInr: number
  readonly taxInr: number
  readonly totalInr: number
}

export interface OrderTrackingData {
  readonly orderNumber: string
  readonly awbNumber: string
  readonly steps: ReadonlyArray<TrackingStep>
  readonly items: ReadonlyArray<TrackingOrderItem>
  readonly shipmentEvents: ReadonlyArray<ShipmentEvent>
  readonly delivery: DeliveryInfo
  readonly totals: TrackingTotals
}
