import type { TrackingOrderItem } from '../../types/ordertracking'
import OrderItemRow from './OrderItemRow'

interface OrderItemSummaryProps {
  items: ReadonlyArray<TrackingOrderItem>
}

export default function OrderItemSummary({ items }: OrderItemSummaryProps) {
  return (
    <section aria-label="Item summary" className="bg-white border border-[#E2E2DE] p-8">
      <h3 className="font-headline-md mb-8 text-[#111110]">Item Summary</h3>
      <div className="space-y-8">
        {items.map((item, index) => (
          <OrderItemRow key={item.id} item={item} isLast={index === items.length - 1} />
        ))}
      </div>
    </section>
  )
}
