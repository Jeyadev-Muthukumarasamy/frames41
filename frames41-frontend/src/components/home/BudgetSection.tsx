import { Link } from 'react-router-dom'
import type { Product } from '../../types/home'
import { formatINR } from '../../utils/format'
import OptimizedImage from '../ui/OptimizedImage'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group rounded-2xl bg-[#2a0914] p-3.5 border border-rose-500/20 shadow-sm hover:border-amber-400/60 hover:shadow-[0_10px_28px_rgba(128,0,32,0.3)] transition-all duration-500">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="aspect-square bg-neutral-900 overflow-hidden relative mb-3 rounded-xl border border-rose-500/30">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.imageAlt}
            widthPreset="card"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 text-neutral-950 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider shadow-md">
              {product.badge}
            </span>
          )}
        </div>
        <div className="text-center">
          <h4 className="font-bold mb-1 group-hover:text-amber-300 transition-colors text-amber-100 text-sm line-clamp-1">
            {product.name}
          </h4>
          <p className="text-amber-400 font-extrabold text-sm">{formatINR(product.priceInr)}</p>
        </div>
      </Link>
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
      className="bg-gradient-to-b from-[#22070f] via-[#18040a] to-[#110207] text-amber-50 py-16 sm:py-xl border-y border-rose-500/30"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-label-bold text-amber-400 text-[10px] tracking-[0.3em] uppercase block mb-1">
            Value Picks
          </span>
          <h2 id="budget-heading" className="font-headline text-[28px] sm:text-headline-lg italic font-extrabold text-amber-100">
            Under {formatINR(priceLimit)}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
