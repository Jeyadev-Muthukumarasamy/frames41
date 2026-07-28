import type { OrderDetails } from '../../types/order'
import OrderMeta from './OrderMeta'
import OrderItemCard from './OrderItemCard'
import OrderTotals from './OrderTotals'

interface OrderSummaryProps {
  order: OrderDetails
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const metaFields = [
    { label: 'Order Number', value: order.orderNumber },
    { label: 'Estimated Delivery', value: order.estimatedDelivery },
    { label: 'Shipping Method', value: order.shippingMethod },
  ] as const

  return (
    <div className="space-y-12">
      <OrderMeta fields={metaFields} />

      <div className="space-y-6">
        <h3 className="text-headline-md text-on-background">Order Summary</h3>
        <div className="bg-surface border border-outline-variant p-8 space-y-6">
          {order.items.map((item) => (
            <OrderItemCard key={item.id} item={item} />
          ))}
          <OrderTotals
            subtotalInr={order.subtotalInr}
            shippingCostInr={order.shippingCostInr}
            totalInr={order.totalInr}
          />
        </div>
      </div>
    </div>
  )
}
