import Icon from '../ui/Icon'

interface ProductListingEmptyStateProps {
  readonly onReset: () => void
}

export default function ProductListingEmptyState({ onReset }: ProductListingEmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center border border-dashed border-on-background/15 px-6 py-16 text-center">
      <Icon name="inventory_2" className="mb-4 text-5xl text-on-background/35" />
      <h2 className="font-headline text-3xl italic text-on-background">No products found</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-on-background/60">
        Try a different search term or browse every category in the collection.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-full bg-on-background px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary"
      >
        Reset Filters
      </button>
    </div>
  )
}
