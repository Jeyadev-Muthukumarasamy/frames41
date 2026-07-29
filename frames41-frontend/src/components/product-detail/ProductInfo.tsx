import type { ProductFeature } from '../../types/productDetail'
import { formatINR } from '../../utils/format'
import StarRating from '../Review/StarRating'
import Icon from '../ui/Icon'

interface ProductInfoProps {
  name: string
  priceInr: number
  inStock: boolean
  reviewAverage: number
  reviewCount: number
  description: string
  features: ReadonlyArray<ProductFeature>
}

export default function ProductInfo({
  name,
  priceInr,
  inStock,
  reviewAverage,
  reviewCount,
  description,
  features,
}: ProductInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {inStock && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
            In Stock
          </span>
        )}
        <div className="flex items-center gap-2">
          <StarRating rating={reviewAverage} size="sm" />
          <span className="text-sm font-bold text-on-background">
            {reviewAverage} ({reviewCount} Reviews)
          </span>
        </div>
      </div>

      <h1 className="text-[28px] sm:text-headline-lg font-headline text-on-background font-bold leading-tight">{name}</h1>
      <p className="text-2xl sm:text-headline-md font-headline text-primary font-bold">{formatINR(priceInr)}</p>

      <hr className="border-outline-variant" />

      <p className="text-body-md sm:text-body-lg text-on-surface-variant leading-relaxed">{description}</p>

      <ul className="flex flex-col gap-3 text-sm sm:text-body-md text-on-surface list-none p-0 m-0">
        {features.map((feature) => (
          <li key={feature.id} className="flex items-start gap-3">
            <Icon name="check" className="text-primary text-lg sm:text-xl shrink-0 mt-0.5" />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
