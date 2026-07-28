import { useCallback, useRef } from 'react'
import type { Product } from '../../types/home'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'

const SCROLL_AMOUNT = 280

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="min-w-[220px] sm:min-w-[300px] snap-start group">
      <a href={`/shop/${product.slug}`} className="block">
        <div className="aspect-square bg-white overflow-hidden relative mb-4 rounded-2xl border border-on-background/5">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
          <h4 className="font-bold mb-1 group-hover:text-primary transition-colors text-on-background">
            {product.name}
          </h4>
          <p className="text-on-background/60 text-label-bold">{formatINR(product.priceInr)}</p>
        </div>
      </a>
    </article>
  )
}

interface NewCollectionsSectionProps {
  products: ReadonlyArray<Product>
}

export default function NewCollectionsSection({ products }: NewCollectionsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((dir: 'prev' | 'next') => {
    scrollRef.current?.scrollBy({
      left: dir === 'next' ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: 'smooth',
    })
  }, [])

  if (products.length === 0) return null

  return (
    <section
      id="new-collections"
      aria-labelledby="new-collections-heading"
      className="py-16 sm:py-xl max-w-container mx-auto px-4 sm:px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 sm:mb-12 gap-4 border-b border-on-background/10 pb-6 sm:pb-8">
        <div>
          <span className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase block mb-1">
            Just In
          </span>
          <h2 id="new-collections-heading" className="font-headline text-[28px] sm:text-headline-lg italic">
            New Collections
          </h2>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => scroll('prev')}
            aria-label="Scroll to previous collections"
            className="w-9 h-9 sm:w-10 sm:h-10 border border-on-background/20 rounded-full flex items-center justify-center hover:bg-on-background hover:text-white transition-all"
          >
            <Icon name="chevron_left" className="text-sm" />
          </button>
          <button
            type="button"
            onClick={() => scroll('next')}
            aria-label="Scroll to next collections"
            className="w-9 h-9 sm:w-10 sm:h-10 border border-on-background/20 rounded-full flex items-center justify-center hover:bg-on-background hover:text-white transition-all"
          >
            <Icon name="chevron_right" className="text-sm" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pb-8 sm:pb-12 snap-x snap-mandatory"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center">
        <a
          href="/shop?sort=newest"
          className="inline-flex items-center justify-center rounded-full border border-on-background/20 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-on-background hover:text-white transition-all"
        >
          View All
          <Icon
            name="arrow_forward"
            className="text-sm ml-2 group-hover:translate-x-1 transition-transform"
          />
        </a>
      </div>
    </section>
  )
}
