import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/home'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'

interface CategoryCardProps {
  category: Category
  index: number
}

const CategoryCard = memo(function CategoryCard({ category, index }: CategoryCardProps) {
  const isWide = category.span === 'wide'

  // Desktop spans (md+)
  const mdSpanClass = isWide ? 'md:col-span-2' : 'md:col-span-1'

  // Mobile bento spans: use category span, but alternate pattern for visual interest
  // First item always wide (featured), then follow category data
  const mobileSpanClass = isWide ? 'col-span-2' : 'col-span-1'

  // Height classes: bento style with varied heights
  // Mobile heights vary by position for visual rhythm
  const mobileHeightClass = isWide
    ? index === 0
      ? 'h-[260px]'
      : 'h-[200px]'
    : 'h-[220px]'

  // Desktop heights
  const mdHeightClass = 'md:h-[500px]'

  return (
    <article
      className={`${mobileSpanClass} ${mdSpanClass} ${mobileHeightClass} ${mdHeightClass} group relative overflow-hidden rounded-2xl`}
    >
      <OptimizedImage
        src={category.imageUrl}
        alt={category.imageAlt}
        widthPreset={isWide ? 'banner' : 'card'}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"
      />
      <div className="absolute bottom-0 left-0 p-4 sm:p-10 w-full text-white">
        <h3 className="font-headline text-lg sm:text-headline-md italic mb-1 sm:mb-2">
          {category.title}
        </h3>
        {category.description && (
          <p className="text-white/80 mb-4 sm:mb-6 text-xs sm:text-sm max-w-xs line-clamp-2 sm:line-clamp-none">
            {category.description}
          </p>
        )}
        <Link
          to={`/shop?categoryId=${category.id}`}
          className="text-[10px] font-bold uppercase tracking-widest border-b border-white pb-1 hover:opacity-80 transition-opacity"
        >
          {category.cta}
        </Link>
      </div>
    </article>
  )
})

interface CategoryGridProps {
  categories: ReadonlyArray<Category>
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section
      id="collections"
      aria-labelledby="categories-heading"
      className="py-16 sm:py-xl max-w-container mx-auto px-4 sm:px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 sm:mb-12 gap-4 border-b border-on-background/10 pb-6 sm:pb-8">
        <div>
          <span className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase block mb-1">
            Collections
          </span>
          <h2
            id="categories-heading"
            className="font-headline text-[28px] sm:text-headline-lg italic"
          >
            Curated Categories
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>

      <div className="flex justify-center mt-8 sm:mt-12">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center rounded-full border border-on-background/20 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-on-background hover:text-white transition-all"
        >
          View All
          <Icon
            name="arrow_forward"
            className="text-sm ml-2 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </section>
  )
}
