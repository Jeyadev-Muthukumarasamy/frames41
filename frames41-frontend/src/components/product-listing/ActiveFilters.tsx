import { formatINR } from '../../utils/format'
import type { ProductFiltersState } from './ProductFilters'
import Icon from '../ui/Icon'

interface ActiveFiltersProps {
  filters: ProductFiltersState
  categories: ReadonlyArray<{ id: string; label: string }>
  onChange: (updates: Partial<ProductFiltersState>) => void
  onClear: () => void
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-on-background/15 bg-surface px-3 py-1.5 text-xs font-medium text-on-background">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center rounded-full text-on-background/50 hover:text-primary"
        aria-label={`Remove ${label} filter`}
      >
        <Icon name="close" className="text-sm" />
      </button>
    </span>
  )
}

export default function ActiveFilters({
  filters,
  categories,
  onChange,
  onClear,
}: ActiveFiltersProps) {
  const chips: { key: string; label: string; remove: () => void }[] = []

  filters.categoryIds.forEach((id) => {
    const cat = categories.find((c) => c.id === id)
    if (cat) {
      chips.push({
        key: `cat-${id}`,
        label: cat.label,
        remove: () =>
          onChange({
            categoryIds: filters.categoryIds.filter((c) => c !== id),
          }),
      })
    }
  })

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const min = filters.minPrice !== null ? formatINR(filters.minPrice) : '₹0'
    const max = filters.maxPrice !== null ? formatINR(filters.maxPrice) : '∞'
    chips.push({
      key: 'price',
      label: `${min} – ${max}`,
      remove: () => onChange({ minPrice: null, maxPrice: null }),
    })
  }

  if (filters.minRating !== null) {
    chips.push({
      key: 'rating',
      label: `${filters.minRating}+ Stars`,
      remove: () => onChange({ minRating: null }),
    })
  }

  if (filters.inStockOnly) {
    chips.push({
      key: 'stock',
      label: 'In Stock',
      remove: () => onChange({ inStockOnly: false }),
    })
  }

  if (filters.searchQuery.trim()) {
    chips.push({
      key: 'search',
      label: `Search: "${filters.searchQuery.trim()}"`,
      remove: () => onChange({ searchQuery: '' }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={chip.remove} />
      ))}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-xs font-medium text-primary underline underline-offset-2 hover:text-on-background"
      >
        Clear all
      </button>
    </div>
  )
}
