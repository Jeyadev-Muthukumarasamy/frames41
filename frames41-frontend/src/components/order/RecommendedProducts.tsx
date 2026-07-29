import type { RecommendedProduct } from '../../types/order'
import RecommendedProductCard from './RecommendedProductCard'

interface RecommendedProductsProps {
  products: ReadonlyArray<RecommendedProduct>
  onProductSelect?: (id: string) => void
}

export default function RecommendedProducts({
  products,
  onProductSelect,
}: RecommendedProductsProps) {
  return (
    <section aria-labelledby="recommended-heading" className="mt-xl">
      <h2 id="recommended-heading" className="text-headline-lg text-on-background mb-12">
        Complete the Collection
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <RecommendedProductCard
            key={product.id}
            product={product}
            onSelect={onProductSelect}
          />
        ))}
      </div>
    </section>
  )
}
