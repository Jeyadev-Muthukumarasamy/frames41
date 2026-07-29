import type { RecommendedProduct } from '../../types/order'
import { formatINR } from '../../utils/format'

interface RecommendedProductCardProps {
  product: RecommendedProduct
  onSelect?: (id: string) => void
}

export default function RecommendedProductCard({
  product,
  onSelect,
}: RecommendedProductCardProps) {
  const { id, name, subtitle, priceInr, imageUrl } = product

  return (
    <article>
      <a
        href={`/shop/${product.slug}`}
        aria-label={`${name} – ${subtitle}, ${formatINR(priceInr)}`}
        onClick={(e) => {
          if (onSelect) {
            e.preventDefault()
            onSelect(id)
          }
        }}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="aspect-square bg-surface-variant overflow-hidden mb-6 rounded-2xl">
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="text-xl font-headline text-on-background">{name}</h4>
            <p className="text-body-md text-on-surface-variant">{subtitle}</p>
          </div>
          <span
            aria-hidden="true"
            className="text-body-md font-bold text-on-background shrink-0"
          >
            {formatINR(priceInr)}
          </span>
        </div>
      </a>
    </article>
  )
}
