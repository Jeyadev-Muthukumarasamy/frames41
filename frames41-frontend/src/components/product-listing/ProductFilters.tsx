import { useCallback, useState } from 'react'
import type { ProductListingCategory, ProductListingSortKey } from '../../types/productListing'
import { PRODUCT_LISTING_SORT_OPTIONS } from '../../constants/productListing'
import Icon from '../ui/Icon'

export interface ProductFiltersState {
  categoryIds: string[]
  minPrice: number | null
  maxPrice: number | null
  minRating: number | null
  inStockOnly: boolean
  searchQuery: string
  sort: ProductListingSortKey
}

interface ProductFiltersProps {
  categories: ReadonlyArray<ProductListingCategory>
  filters: ProductFiltersState
  onChange: (updates: Partial<ProductFiltersState>) => void
  onClear: () => void
  resultCount: number
}

function PriceInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  placeholder: string
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-on-background/70">
      <span>{label}</span>
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value === '' ? null : Number(e.target.value)
          onChange(val)
        }}
        className="h-10 w-full rounded-lg border border-on-background/15 bg-transparent px-3 text-sm text-on-background outline-none transition-colors placeholder:text-on-background/35 focus:border-primary"
      />
    </label>
  )
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-on-background/10 pb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-widest text-on-background"
      >
        {title}
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          className="text-base text-on-background/50"
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

function StarRow({
  rating,
  active,
  onClick,
}: {
  rating: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-on-background hover:bg-on-background/5'}`}
    >
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon
            key={i}
            name="star"
            className={`text-base ${i < rating ? 'text-primary' : 'text-on-background/20'}`}
            filled={i < rating}
          />
        ))}
      </div>
      <span className="text-xs font-medium">&amp; Up</span>
    </button>
  )
}

export default function ProductFilters({
  categories,
  filters,
  onChange,
  onClear,
  resultCount,
}: ProductFiltersProps) {
  const hasActiveFilters =
    filters.categoryIds.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.minRating !== null ||
    filters.inStockOnly ||
    filters.searchQuery.trim().length > 0

  const toggleCategory = useCallback(
    (id: string) => {
      const next = filters.categoryIds.includes(id)
        ? filters.categoryIds.filter((c) => c !== id)
        : [...filters.categoryIds, id]
      onChange({ categoryIds: next })
    },
    [filters.categoryIds, onChange],
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-on-background">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary underline underline-offset-2 hover:text-on-background"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <FilterSection title="Search" defaultOpen>
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-background/45"
          />
          <input
            type="search"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search products..."
            className="h-10 w-full rounded-lg border border-on-background/15 bg-transparent pl-9 pr-3 text-sm text-on-background outline-none transition-colors placeholder:text-on-background/35 focus:border-primary"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-background/40 hover:text-on-background"
            >
              <Icon name="close" className="text-base" />
            </button>
          )}
        </div>
      </FilterSection>

      {/* Sort (mobile sidebar convenience) */}
      <FilterSection title="Sort By" defaultOpen={false}>
        <div className="flex flex-col gap-1">
          {PRODUCT_LISTING_SORT_OPTIONS.map((opt) => {
            const active = filters.sort === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ sort: opt.value })}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-on-background text-white' : 'text-on-background hover:bg-on-background/5'}`}
              >
                {opt.label}
                {active && <Icon name="check" className="text-base" />}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection title="Categories">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const checked = filters.categoryIds.includes(cat.id)
              return (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-on-background/5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 rounded border-on-background/30 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-on-background">{cat.label}</span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <PriceInput
              label="Min"
              value={filters.minPrice}
              onChange={(v) => onChange({ minPrice: v })}
              placeholder="₹0"
            />
            <PriceInput
              label="Max"
              value={filters.maxPrice}
              onChange={(v) => onChange({ maxPrice: v })}
              placeholder="₹5000"
            />
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={filters.maxPrice ?? 5000}
            onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-background/50">
            <span>₹0</span>
            <span>₹5,000+</span>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="flex flex-col gap-1">
          {[4, 3, 2, 1].map((r) => (
            <StarRow
              key={r}
              rating={r}
              active={filters.minRating === r}
              onClick={() =>
                onChange({ minRating: filters.minRating === r ? null : r })
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-on-background/5">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked })}
            className="h-4 w-4 rounded border-on-background/30 text-primary focus:ring-primary"
          />
          <span className="text-sm text-on-background">In Stock Only</span>
        </label>
      </FilterSection>

      {/* Result count */}
      <p className="text-xs text-on-background/50">
        {resultCount} {resultCount === 1 ? 'product' : 'products'} found
      </p>
    </div>
  )
}
