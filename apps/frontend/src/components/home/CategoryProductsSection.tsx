import { useState } from 'react'
import type { CategoryProductSection, Product } from '../../types/home'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'

interface CategoryProductCardProps {
  product: Product
  onAddToCart: (productId: string) => Promise<unknown>
}

function CategoryProductCard({ product, onAddToCart }: CategoryProductCardProps) {
  const [adding, setAdding] = useState(false)
  const discount = product.originalPriceInr
    ? Math.round((1 - product.priceInr / product.originalPriceInr) * 100)
    : 0

  const handleAddToCart = async () => {
    if (adding) return
    setAdding(true)
    try {
      await onAddToCart(product.id)
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="group min-w-0">
      <a href={`/shop/${product.slug}`} className="block">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-neutral-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-200 px-4 text-center text-xs text-neutral-500">
              {product.name}
            </div>
          )}
          {discount > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold text-white">
              -{discount}% OFF
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 min-h-10 text-center text-sm font-semibold leading-5 text-on-background transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-2 flex min-h-5 items-center justify-center gap-2 text-sm">
          {product.originalPriceInr && (
            <span className="text-xs text-on-background/45 line-through">
              {formatINR(product.originalPriceInr)}
            </span>
          )}
          <span className="font-medium text-on-background">{formatINR(product.priceInr)}</span>
        </div>
      </a>

      {product.hasOptions ? (
        <a
          href={`/shop/${product.slug}`}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Choose options
        </a>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="mt-3 w-full rounded-lg border border-primary px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {adding ? 'Adding…' : 'Add to cart'}
        </button>
      )}
    </article>
  )
}

interface CategoryProductsSectionProps {
  sections: ReadonlyArray<CategoryProductSection>
  onAddToCart: (productId: string) => Promise<unknown>
}

export default function CategoryProductsSection({
  sections,
  onAddToCart,
}: CategoryProductsSectionProps) {
  if (sections.length === 0) return null

  return (
    <section
      id="collections"
      aria-labelledby="categories-heading"
      className="mx-auto max-w-container px-4 py-16 sm:px-6 sm:py-xl"
    >
      <div className="mb-10 border-b border-on-background/10 pb-6 sm:mb-14 sm:pb-8">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Shop by collection
        </span>
        <h2 id="categories-heading" className="font-headline text-[28px] italic sm:text-headline-lg">
          Categories
        </h2>
      </div>

      <div className="space-y-16 sm:space-y-20">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`category-${section.id}`}>
            <h3
              id={`category-${section.id}`}
              className="mb-6 font-headline text-2xl sm:mb-8 sm:text-3xl"
            >
              {section.title}
            </h3>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-5 md:grid-cols-4">
              {section.products.map((product) => (
                <CategoryProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:mt-10">
              <a
                href={`/shop?categoryId=${encodeURIComponent(section.id)}`}
                className="group inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                View all
                <Icon
                  name="arrow_forward"
                  className="ml-2 text-sm transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
