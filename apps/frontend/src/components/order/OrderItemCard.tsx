import type { OrderItem } from '../../types/order'
import { formatINR } from '../../utils/format'

interface OrderItemCardProps {
  item: OrderItem
}

export default function OrderItemCard({ item }: OrderItemCardProps) {
  const { name, description, priceInr, quantity, imageUrl, imageAlt } = item

  return (
    <article className="flex gap-6 items-start">
      <div className="w-24 h-32 bg-surface-variant overflow-hidden flex-shrink-0 rounded-2xl">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <h4 className="text-xl font-headline text-on-background">{name}</h4>
          <span className="text-body-md font-bold text-on-background shrink-0">
            {formatINR(priceInr)}
          </span>
        </div>
        <p className="text-body-md text-on-surface-variant mt-1">{description}</p>
        <p className="text-label-sm text-on-surface-variant/60 mt-4 uppercase tracking-widest">
          Qty: {String(quantity).padStart(2, '0')}
        </p>
      </div>
    </article>
  )
}
