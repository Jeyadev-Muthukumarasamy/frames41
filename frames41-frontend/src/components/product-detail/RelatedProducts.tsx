import type { RelatedProduct } from '../../types/productDetail'
import RelatedProductCard from './RelatedProductCard'

interface RelatedProductsProps {
  products: ReadonlyArray<RelatedProduct>
  onProductClick?: (id: string) => void
  onViewAll?: () => void
}

export default function RelatedProducts({
  products,
  onProductClick,
  onViewAll,
}: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section
      className="mt-12 sm:mt-xl pt-12 sm:pt-xl border-t border-outline-variant"
      aria-label="Complete the collection"
    >
      <div className="flex items-baseline justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-headline-lg font-headline font-bold text-on-background">
          Complete the Collection
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          View All
        </button>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-gutter list-none p-0 m-0">
        {products.map((product) => (
          <li key={product.id}>
            <RelatedProductCard product={product} onClick={onProductClick} />
          </li>
        ))}
      </ul>
    </section>
  )
}
