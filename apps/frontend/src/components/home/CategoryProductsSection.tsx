import { Link } from 'react-router-dom'
import type { CategoryProductSection, Product } from '../../types/home'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'

interface CategoryProductCardProps {
  product: Product
}

function CategoryProductCard({ product }: CategoryProductCardProps) {
  const discount = product.originalPriceInr
    ? Math.round((1 - product.priceInr / product.originalPriceInr) * 100)
    : 0

  return (
    <article className="group min-w-0 flex flex-col justify-between rounded-2xl bg-[#faf8f0] p-3.5 border border-[#800020]/20 shadow-sm hover:border-[#800020] hover:shadow-[0_10px_28px_rgba(128,0,32,0.15)] transition-all duration-500">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-[#ede8d5] border border-[#800020]/15">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.imageAlt}
            widthPreset="card"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute bottom-3 left-3 rounded-md bg-gradient-to-r from-[#800020] via-[#9b2039] to-[#800020] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow-md border border-amber-400/30">
              -{discount}% OFF
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 min-h-10 text-center text-sm font-bold leading-snug text-[#2b0b14] transition-colors group-hover:text-[#800020]">
          {product.name}
        </h3>
        <div className="mt-2 flex min-h-5 items-center justify-center gap-2 text-sm">
          {product.originalPriceInr && (
            <span className="text-xs text-[#58111a]/50 line-through">
              {formatINR(product.originalPriceInr)}
            </span>
          )}
          <span className="font-extrabold text-[#800020]">{formatINR(product.priceInr)}</span>
        </div>
      </Link>
    </article>
  )
}

interface CategoryProductsSectionProps {
  sections: ReadonlyArray<CategoryProductSection>
}

export default function CategoryProductsSection({
  sections,
}: CategoryProductsSectionProps) {
  if (sections.length === 0) return null

  return (
    <section
      id="collections"
      aria-labelledby="categories-heading"
      className="mx-auto max-w-container px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-xl"
    >
      <div className="mb-10 border-b border-[#800020]/20 pb-6 sm:mb-14 sm:pb-8">
        <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.3em] text-[#800020]">
          Shop by collection
        </span>
        <h2 id="categories-heading" className="font-headline text-[28px] italic font-extrabold text-[#2b0b14] sm:text-headline-lg">
          Curated Categories
        </h2>
      </div>

      <div className="space-y-16 sm:space-y-20">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`category-${section.id}`}>
            <h3
              id={`category-${section.id}`}
              className="mb-6 font-headline text-2xl font-bold text-[#2b0b14] border-l-4 border-[#800020] pl-3.5 sm:mb-8 sm:text-3xl"
            >
              {section.title}
            </h3>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-5 md:grid-cols-4">
              {section.products.map((product) => (
                <CategoryProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:mt-10">
              <Link
                to={`/shop?categoryId=${encodeURIComponent(section.id)}`}
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#2e0914] via-[#380b17] to-[#1f060d] px-7 py-3 text-xs font-extrabold uppercase tracking-widest text-amber-300 border border-[#800020]/40 shadow-md transition-all hover:bg-gradient-to-r hover:from-[#800020] hover:via-[#9b2039] hover:to-[#800020] hover:text-white"
              >
                View all in {section.title}
                <Icon
                  name="arrow_forward"
                  className="ml-2 text-sm transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
