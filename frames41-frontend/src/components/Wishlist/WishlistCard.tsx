import type { WishlistItem } from '../../types/wishlist'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'

interface WishlistCardProps {
  item: WishlistItem
  priority?: boolean
  onRemove: (id: string) => void
  onAddToCart: (id: string) => void
}

export default function WishlistCard({
  item,
  priority = false,
  onRemove,
  onAddToCart,
}: WishlistCardProps) {
  const { id, name, material, priceInr, imageUrl, imageAlt } = item
  const formattedPrice = formatINR(priceInr)

  return (
    <article
      aria-label={`${name} – ${material}, ${formattedPrice}`}
      className="group relative bg-surface border border-outline-variant flex flex-col transition-all duration-300 hover:border-on-surface-variant overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-container-low rounded-t-2xl">
        <img
          src={imageUrl}
          alt={imageAlt}
          width={400}
          height={400}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remove ${name} from wishlist`}
          className="absolute top-4 right-4 bg-white/90 p-2 backdrop-blur-sm text-on-background hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="p-lg flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-sm gap-4">
          <h2 className="font-headline-md text-body-lg text-on-surface">{name}</h2>
          <span
            className="font-label-bold text-label-bold text-on-surface shrink-0"
            aria-label={`Price: ${formattedPrice}`}
          >
            {formattedPrice}
          </span>
        </div>
        <p className="font-body-md text-label-sm text-secondary mb-lg uppercase tracking-wider">
          {material}
        </p>
        <button
          type="button"
          onClick={() => onAddToCart(id)}
          aria-label={`Add ${name} to cart`}
          className="mt-auto w-full py-md px-lg bg-[#800020] text-white font-label-bold text-label-bold uppercase tracking-[0.1em] transition-transform active:scale-95 hover:bg-[#600018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800020] focus-visible:ring-offset-2"
        >
          Add to Cart
        </button>
      </div>
    </article>
  )
}
