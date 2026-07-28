import { useState, useCallback } from 'react'
import type { ProductListingProduct } from '../../types/productListing'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'
import { getProductHref } from '@/utils/productListing'


interface ProductListingCardProps {
  readonly product: ProductListingProduct
  readonly onAddToCart?: (productId: string) => Promise<unknown>
  readonly onProductSelect?: (productId: string) => void
}

export default function ProductListingCard({
  product,
  onAddToCart,
  onProductSelect,
}: ProductListingCardProps) {
  const isInStock = product.inStock ?? true
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart || status !== 'idle') return
    setStatus('adding')
    try {
      await onAddToCart(product.id)
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('idle')
    }
  }, [onAddToCart, product.id, status])

  const buttonText =
    status === 'adding' ? 'Adding…'
    : status === 'added' ? 'Added'
    : isInStock ? 'Add to Cart'
    : 'Unavailable'

  return (
    <article className="group flex h-full flex-col">
      <a
        href={getProductHref(product.slug)}
        onClick={() => onProductSelect?.(product.slug)}
        className="flex flex-1 flex-col"
      >
        <div className="relative mb-4 aspect-square shrink-0 overflow-hidden rounded-2xl bg-white">
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              {product.badge}
            </span>
          )}
          {!isInStock && (
            <span className="absolute bottom-4 left-4 rounded-full bg-on-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              Sold Out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-headline line-clamp-2 text-xl italic text-on-background transition-colors group-hover:text-primary">
              {product.name}
            </h3>
            <span className="shrink-0 text-sm font-bold text-on-background">
              {formatINR(product.priceInr)}
            </span>
          </div>

          {product.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-on-background/60">
              {product.description}
            </p>
          )}

          {typeof product.rating === 'number' && (
            <p className="mt-3 flex items-center gap-1 text-sm text-on-background/60">
              <Icon name="star" filled className="text-base text-primary" />
              <span className="font-bold text-on-background">{product.rating.toFixed(1)}</span>
              {typeof product.reviewCount === 'number' && <span>({product.reviewCount})</span>}
            </p>
          )}
        </div>
      </a>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isInStock || status === 'adding'}
        className="mt-5 h-11 w-full rounded-full bg-on-background px-5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-on-background/25"
      >
        {buttonText}
      </button>
    </article>
  )
}
