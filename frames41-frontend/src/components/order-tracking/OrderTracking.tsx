import type { OrderTrackingData } from '../../types/ordertracking'
import OrderTrackingHeader from './OrderTrackingHeader'
import OrderStatusTracker from './OrderStatusTracker'
import OrderItemSummary from './OrderItemSummary'
import ShipmentActivity from './ShipmentActivity'
import DeliveryDetailsCard from './DeliveryDetailsCard'
import OrderTotalsCard from './OrderTotalsCard'

interface OrderTrackingProps {
  data: OrderTrackingData
  onSupportInquiry?: () => void
  onDownloadInvoice?: () => void
}

export default function OrderTracking({
  data,
  onSupportInquiry,
  onDownloadInvoice,
}: OrderTrackingProps) {
  return (
    <main className="pt-32 pb-section px-6 md:px-12 max-w-container-max mx-auto">
      <OrderTrackingHeader
        orderNumber={data.orderNumber}
        awbNumber={data.awbNumber}
      />

      <OrderStatusTracker steps={data.steps} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 space-y-6">
          <OrderItemSummary items={data.items} />
          <ShipmentActivity events={data.shipmentEvents} />
        </div>

        <aside className="lg:col-span-4 space-y-gutter">
          <DeliveryDetailsCard delivery={data.delivery} />
          <OrderTotalsCard
            totals={data.totals}
            onSupportInquiry={onSupportInquiry}
            onDownloadInvoice={onDownloadInvoice}
          />
        </aside>
      </div>
    </main>
  )
}
