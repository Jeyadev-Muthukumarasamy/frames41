import type { FaqCategory, FaqCategoryId } from '../../types/faq'

interface FaqCategoryTabsProps {
  categories: ReadonlyArray<FaqCategory>
  activeId: FaqCategoryId
  onSelect: (id: FaqCategoryId) => void
}

export default function FaqCategoryTabs({ categories, activeId, onSelect }: FaqCategoryTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: FaqCategoryId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Filter FAQ by category"
      className="flex flex-wrap gap-4 mb-12 border-b border-surface-container-highest pb-6"
    >
      {categories.map(({ id, label }) => {
        const isActive = id === activeId
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => handleKeyDown(e, id)}
            className={[
              'px-6 py-2 font-label-bold uppercase tracking-widest transition-colors',
              isActive
                ? 'bg-on-surface text-background'
                : 'border border-surface-container-highest text-on-surface hover:bg-surface-container',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
