import type { TrackingOrderItem } from '../../types/ordertracking'
import { formatINR } from '../../utils/format'

interface OrderItemRowProps {
  item: TrackingOrderItem
  isLast: boolean
}

export default function OrderItemRow({ item, isLast }: OrderItemRowProps) {
  const { name, subtitle, size, quantity, priceInr, imageUrl, imageAlt } = item

  return (
    <article className={`flex gap-6 ${isLast ? '' : 'pb-8 border-b border-[#EEEEEC]'}`}>
      <div className="w-32 h-40 bg-[#F8F8F6] overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <h4 className="font-headline-md text-2xl text-[#111110]">{name}</h4>
          <p className="text-secondary font-body-md mt-1">{subtitle}</p>
        </div>

        <div className="flex justify-between items-end">
          <dl className="text-label-sm space-y-1">
            <div className="flex gap-2">
              <dt className="text-secondary uppercase tracking-widest">Size:</dt>
              <dd>{size}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-secondary uppercase tracking-widest">Qty:</dt>
              <dd>{quantity}</dd>
            </div>
          </dl>
          <p className="font-label-bold text-lg text-[#111110]">{formatINR(priceInr)}</p>
        </div>
      </div>
    </article>
  )
}
