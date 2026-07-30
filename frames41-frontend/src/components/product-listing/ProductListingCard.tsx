import { useState, useCallback, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ProductListingProduct } from '../../types/productListing'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'
import { getProductHref } from '@/utils/productListing'
import OptimizedImage from '../ui/OptimizedImage'
import { api } from '@/lib/api'

interface ProductListingCardProps {
  readonly product: ProductListingProduct
  readonly onAddToCart?: (productId: string) => Promise<unknown>
  readonly onProductSelect?: (productId: string) => void
}

export default memo(function ProductListingCard({
  product,
  onAddToCart,
  onProductSelect,
}: ProductListingCardProps) {
  const navigate = useNavigate()
  const isInStock = product.inStock ?? true
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isInStock || status !== 'idle') return

    if (product.hasOptions) {
      navigate(getProductHref(product.slug))
      return
    }

    if (!onAddToCart) return
    setStatus('adding')
    try {
      await onAddToCart(product.id)
      setStatus('added')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('idle')
      navigate(getProductHref(product.slug))
    }
  }, [isInStock, status, product.hasOptions, product.slug, product.id, onAddToCart, navigate])

  const buttonText =
    status === 'adding' ? 'Adding…'
    : status === 'added' ? 'Added to Cart ✓'
    : !isInStock ? 'Sold Out'
    : product.hasOptions ? 'Customize & Order'
    : 'Add to Cart'

  return (
    <article className="group flex h-full flex-col rounded-2xl bg-[#faf8f0] p-3.5 sm:p-4 border border-[#800020]/20 shadow-sm hover:border-[#800020] hover:shadow-[0_12px_32px_rgba(128,0,32,0.15)] transition-all duration-500">
      <Link
        to={getProductHref(product.slug)}
        onMouseEnter={() => { api.products.getBySlug(product.slug).catch(() => {}) }}
        onClick={() => onProductSelect?.(product.slug)}
        className="flex flex-1 flex-col"
      >
        <div className="relative mb-3.5 aspect-square shrink-0 overflow-hidden rounded-xl bg-[#ede8d5] border border-[#800020]/15">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.imageAlt}
            widthPreset="card"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#2b0b14]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {product.badge && (
            <span className="absolute left-3 top-3 rounded-md bg-gradient-to-r from-[#800020] via-[#9b2039] to-[#800020] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow-md border border-amber-400/30">
              {product.badge}
            </span>
          )}

          {!isInStock && (
            <span className="absolute bottom-3 left-3 rounded-md bg-neutral-900/90 backdrop-blur-md border border-neutral-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold line-clamp-2 text-base text-[#2b0b14] transition-colors group-hover:text-[#800020]">
                {product.name}
              </h3>
              <span className="shrink-0 text-base font-extrabold text-[#800020]">
                {formatINR(product.priceInr)}
              </span>
            </div>

            {product.description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#58111a]/70">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-[#58111a]/80 border-t border-[#800020]/15 pt-2">
            <div className="flex items-center gap-1 font-semibold text-[#800020]">
              <Icon name="star" filled className="text-sm fill-current text-amber-600" />
              <span>4.9</span>
            </div>
            <span className="text-[11px] font-bold text-[#800020] bg-[#efe7d3] px-2 py-0.5 rounded border border-[#800020]/20">
              Handcrafted Wood
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isInStock || status === 'adding'}
        className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-[#2e0914] via-[#380b17] to-[#1f060d] px-4 text-xs font-extrabold uppercase tracking-wider text-amber-300 border border-[#800020]/40 transition-all hover:bg-gradient-to-r hover:from-[#800020] hover:via-[#9b2039] hover:to-[#800020] hover:text-white hover:border-amber-400 hover:shadow-lg hover:shadow-[#800020]/30 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </button>
    </article>
  )
})
