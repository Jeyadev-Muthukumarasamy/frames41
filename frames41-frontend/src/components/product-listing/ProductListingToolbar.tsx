import { PRODUCT_LISTING_SORT_OPTIONS } from '../../constants/productListing'
import type {
  ProductListingCategory,
  ProductListingSortKey,
} from '../../types/productListing'
import Icon from '../ui/Icon'

interface ProductListingToolbarProps {
  readonly categories: ReadonlyArray<ProductListingCategory>
  readonly activeCategoryId: string
  readonly searchQuery: string
  readonly sortKey: ProductListingSortKey
  readonly resultCount: number
  readonly onCategoryChange: (categoryId: string) => void
  readonly onSearchChange: (value: string) => void
  readonly onSortChange: (sortKey: ProductListingSortKey) => void
}

export default function ProductListingToolbar({
  categories,
  activeCategoryId,
  searchQuery,
  sortKey,
  resultCount,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: ProductListingToolbarProps) {
  return (
    <section
      aria-label="Product listing controls"
      className="border-y border-on-background/10 py-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="list" aria-label="Product categories">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? 'border-on-background bg-on-background text-white'
                    : 'border-on-background/15 text-on-background hover:border-primary hover:text-primary'
                }`}
                aria-pressed={isActive}
              >
                {category.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 sm:w-72">
            <span className="sr-only">Search products</span>
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-on-background/45" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.currentTarget.value)}
              placeholder="Search products"
              maxLength={80}
              className="h-11 w-full rounded-full border border-on-background/15 bg-transparent pl-10 pr-4 text-sm text-on-background outline-none transition-colors placeholder:text-on-background/45 focus:border-primary"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-on-background/65">
            <span className="shrink-0">Sort</span>
            <select
              value={sortKey}
              onChange={(event) => onSortChange(event.currentTarget.value as ProductListingSortKey)}
              className="h-11 rounded-full border border-on-background/15 bg-background px-4 text-sm font-bold text-on-background outline-none transition-colors focus:border-primary"
            >
              {PRODUCT_LISTING_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-4 text-sm text-on-background/55" aria-live="polite">
        {resultCount} {resultCount === 1 ? 'product' : 'products'} found
      </p>
    </section>
  )
}
