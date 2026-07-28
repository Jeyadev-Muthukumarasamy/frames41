import type { ProductListingProduct } from '../../types/productListing'
import ProductListingCard from './ProductListingCard'

interface ProductListingGridProps {
  readonly products: ReadonlyArray<ProductListingProduct>
  readonly onAddToCart?: (productId: string) => Promise<unknown>
  readonly onProductSelect?: (productId: string) => void
}

export default function ProductListingGrid({
  products,
  onAddToCart,
  onProductSelect,
}: ProductListingGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductListingCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onProductSelect={onProductSelect}
        />
      ))}
    </div>
  )
}
