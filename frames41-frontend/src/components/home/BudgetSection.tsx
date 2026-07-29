import type { Product } from '../../types/home'
import { formatINR } from '../../utils/format'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <a href={`/shop/${product.slug}`} className="block">
        <div className="aspect-square bg-white overflow-hidden relative mb-4 rounded-2xl">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              loading="lazy"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200" />
          )}
          {product.badge && (
            <span className="absolute top-4 left-4 bg-primary text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              {product.badge}
            </span>
          )}
        </div>
        <div className="text-center">
          <h4 className="font-bold mb-1 group-hover:text-primary transition-colors text-background">
            {product.name}
          </h4>
          <p className="text-white/60 text-label-bold">{formatINR(product.priceInr)}</p>
        </div>
      </a>
    </article>
  )
}

interface BudgetSectionProps {
  products: ReadonlyArray<Product>
  priceLimit?: number
}

export default function BudgetSection({ products, priceLimit = 999 }: BudgetSectionProps) {
  return (
    <section
      id="budget"
      aria-labelledby="budget-heading"
      className="bg-on-background text-background py-16 sm:py-xl"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase block mb-1">
            Value Picks
          </span>
          <h2 id="budget-heading" className="font-headline text-[28px] sm:text-headline-lg italic">
            Under {formatINR(priceLimit)}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {products.slice(0, 8).map((product, index) => (
            <div
              key={product.id}
              className={index >= 4 ? 'hidden md:block' : ''}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
