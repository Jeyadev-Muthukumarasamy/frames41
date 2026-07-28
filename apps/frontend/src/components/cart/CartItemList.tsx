import type { CartLineItem } from '../../types/shipping'
import CartItem from './CartItem'

interface CartItemListProps {
  items: ReadonlyArray<CartLineItem>
  quantities: Readonly<Record<string, number>>
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
}

export default function CartItemList({
  items,
  quantities,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-body-lg text-on-surface-variant mb-4">Your workshop is empty.</p>
        <a
          href="/shop"
          className="font-bold uppercase tracking-widest text-[10px] text-primary-container hover:underline"
        >
          Explore the Shop
        </a>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 list-none p-0 m-0" aria-label="Items in cart">
      {items.map((item) => (
        <li key={item.id}>
          <CartItem
            item={item}
            quantity={quantities[item.id] ?? item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
          />
        </li>
      ))}
    </ul>
  )
}
