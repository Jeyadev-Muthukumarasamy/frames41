import { useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/home'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'

const SCROLL_AMOUNT = 424

interface BestsellerCardProps {
  product: Product
}

function BestsellerCard({ product }: BestsellerCardProps) {
  return (
    <article className="min-w-[280px] sm:min-w-[400px] snap-start group">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="mb-6 aspect-square overflow-hidden rounded-2xl">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.imageAlt}
            widthPreset="card"
            className="block h-full w-full object-cover"
          />
        </div>
        <h3 className="font-headline text-xl sm:text-headline-md italic mb-1 sm:mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-on-background/60 mb-4 sm:mb-6 text-sm">{product.description}</p>
        )}
      </Link>
      <div className="flex justify-between items-center">
        <span className="text-label-bold text-base sm:text-lg">{formatINR(product.priceInr)}</span>
      </div>
    </article>
  )
}

interface BestsellersSectionProps {
  products: ReadonlyArray<Product>
}

export default function BestsellersSection({ products }: BestsellersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((dir: 'prev' | 'next') => {
    scrollRef.current?.scrollBy({
      left: dir === 'next' ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: 'smooth',
    })
  }, [])

  return (
    <section
      aria-labelledby="bestsellers-heading"
      className="pt-10 pb-6 sm:pt-14 sm:pb-8 max-w-container mx-auto px-4 sm:px-6"
    >
      <div className="flex justify-between items-baseline mb-8 sm:mb-12 border-b border-on-background/10 pb-6 sm:pb-8">
        <div>
          <span className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase block mb-1">
            Top Choice
          </span>
          <h2 id="bestsellers-heading" className="font-headline text-[28px] sm:text-headline-lg italic">
            Bestsellers
          </h2>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => scroll('prev')}
            aria-label="Scroll to previous bestsellers"
            className="w-9 h-9 sm:w-10 sm:h-10 border border-on-background/20 rounded-full flex items-center justify-center hover:bg-on-background hover:text-white transition-all"
          >
            <Icon name="chevron_left" className="text-sm" />
          </button>
          <button
            type="button"
            onClick={() => scroll('next')}
            aria-label="Scroll to next bestsellers"
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
          <BestsellerCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
