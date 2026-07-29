import type { CartLineItem } from '../../types/shipping'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'

interface CartItemProps {
  item: CartLineItem
  quantity: number
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
}

export default function CartItem({ item, quantity, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <article className="bg-white border border-outline-variant rounded-xl p-3 sm:p-5 lg:p-6 flex gap-3 sm:gap-4 lg:gap-5 transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg overflow-hidden shrink-0 bg-surface-container">
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col justify-between min-w-0">
        {/* Top: name + price */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-headline text-body-md sm:text-lg lg:text-xl text-on-background mb-0.5 sm:mb-1 truncate">{item.name}</h3>
            <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant">{item.variant}</p>
            {item.inStock === true && (
              <div
                role="status"
                className="mt-1 sm:mt-2 inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-emerald-100"
              >
                <Icon name="check_circle" filled className="text-[10px] sm:text-[12px]" />
                In Stock
              </div>
            )}
          </div>
          <span className="font-headline text-body-md sm:text-lg lg:text-xl text-on-background shrink-0">
            {formatINR(item.priceInr)}
          </span>
        </div>

        {/* Bottom: qty + remove */}
        <div className="flex justify-between items-center mt-2 sm:mt-4 lg:mt-5">
          <div
            role="group"
            aria-label={`Quantity for ${item.name}`}
            className="flex items-center border border-on-background/10 rounded-full bg-surface p-0.5 sm:p-1"
          >
            <button
              type="button"
              onClick={() => onDecrement(item.id)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-on-background hover:bg-on-background/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="remove" className="text-sm" />
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              className="px-3 sm:px-4 font-bold text-on-background select-none min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              aria-label="Increase quantity"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-on-background hover:bg-on-background/5 transition-colors"
            >
              <Icon name="add" className="text-sm" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex items-center gap-1 text-on-background/40 hover:text-error transition-colors font-bold uppercase text-[10px] tracking-widest"
          >
            <Icon name="delete" className="text-sm" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </article>
  )
}
