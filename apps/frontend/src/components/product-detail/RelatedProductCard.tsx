import type { RelatedProduct } from '../../types/productDetail'
import { formatINR } from '../../utils/format'

interface RelatedProductCardProps {
  product: RelatedProduct
  onClick?: (id: string) => void
}

export default function RelatedProductCard({ product, onClick }: RelatedProductCardProps) {
  return (
    <article
      className="group cursor-pointer"
      onClick={() => onClick?.(product.slug)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(product.id)
        }
      }}
      aria-label={`${product.name} — ${formatINR(product.priceInr)}`}
    >
      <div className="aspect-square rounded-2xl overflow-hidden relative mb-4">
        <img
          src={product.imageUrl}
          alt={product.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
            {product.badge}
          </span>
        )}
      </div>
      <h3 className="text-base sm:text-headline-md font-headline font-bold text-on-background mb-1">
        {product.name}
      </h3>
      <p className="text-sm sm:text-body-md font-bold text-primary">{formatINR(product.priceInr)}</p>
    </article>
  )
}
