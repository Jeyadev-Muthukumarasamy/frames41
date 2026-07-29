import type { WishlistItem } from '../../types/wishlist'
import WishlistCard from './WishlistCard'

interface WishlistGridProps {
  items: ReadonlyArray<WishlistItem>
  onRemove: (id: string) => void
  onAddToCart: (id: string) => void
}

export default function WishlistGrid({ items, onRemove, onAddToCart }: WishlistGridProps) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        className="py-24 text-center text-secondary font-body-md text-body-md border border-dashed border-outline-variant"
      >
        No items in your wishlist yet.
      </div>
    )
  }

  return (
    <ul
      role="list"
      aria-label="Wishlist items"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter list-none m-0 p-0"
    >
      {items.map((item, index) => (
        <li key={item.id}>
          <WishlistCard
            item={item}
            priority={index === 0}
            onRemove={onRemove}
            onAddToCart={onAddToCart}
          />
        </li>
      ))}
    </ul>
  )
}
