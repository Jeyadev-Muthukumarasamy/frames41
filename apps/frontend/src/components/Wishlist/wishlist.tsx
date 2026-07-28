import { useState, useCallback } from 'react'
import type { WishlistBanner, WishlistItem } from '../../types/wishlist'
import WishlistHeader from './WishlistHeader'
import WishlistGrid from './WishlistGrid'
import WishlistFeaturedSection from './WishlistFeaturedSection'

interface WishlistProps {
  items: ReadonlyArray<WishlistItem>
  banner: WishlistBanner
  onRemoveItem?: (id: string) => void
  onAddToCart?: (id: string) => void
}

export default function Wishlist({ items, banner, onRemoveItem, onAddToCart }: WishlistProps) {
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(new Set())

  const handleRemove = useCallback(
    (id: string) => {
      setRemovedIds((prev) => new Set([...prev, id]))
      onRemoveItem?.(id)
    },
    [onRemoveItem],
  )

  const handleAddToCart = useCallback(
    (id: string) => {
      onAddToCart?.(id)
    },
    [onAddToCart],
  )

  const visibleItems = items.filter((item) => !removedIds.has(item.id))

  return (
    <main
      id="wishlist-content"
      className="pt-32 pb-section px-6 md:px-gutter max-w-container-max mx-auto w-full"
    >
      <WishlistHeader count={visibleItems.length} />
      <WishlistGrid
        items={visibleItems}
        onRemove={handleRemove}
        onAddToCart={handleAddToCart}
      />
      <WishlistFeaturedSection banner={banner} />
    </main>
  )
}
