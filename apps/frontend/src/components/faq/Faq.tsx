import { useMemo, useState } from 'react'
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_HEADINGS,
  FAQ_CATEGORY_ORDER,
  FAQ_ITEMS,
  FAQ_SIDEBAR_DEFAULTS,
} from '../../constants/faq'
import type { FaqCategoryGroup, FaqCategoryId, FaqProps } from '../../types/faq'
import FaqCategorySection from './FaqCategorySection'
import FaqCategoryTabs from './FaqCategoryTabs'
import FaqHeader from './FaqHeader'
import FaqSidebar from './FaqSidebar'

export default function Faq({
  categories = FAQ_CATEGORIES,
  items = FAQ_ITEMS,
  sidebar = FAQ_SIDEBAR_DEFAULTS,
  onContactSupport,
  onConciergeContact,
}: FaqProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId>('all')

  const categoryGroups = useMemo<ReadonlyArray<FaqCategoryGroup>>(() => {
    const filteredItems =
      activeCategory === 'all'
        ? items
        : items.filter((item) => item.categoryId === activeCategory)

    return FAQ_CATEGORY_ORDER.reduce<FaqCategoryGroup[]>((acc, categoryId) => {
      const grouped = filteredItems.filter((item) => item.categoryId === categoryId)
      if (grouped.length === 0) return acc
      acc.push({ id: categoryId, heading: FAQ_CATEGORY_HEADINGS[categoryId], items: grouped })
      return acc
    }, [])
  }, [items, activeCategory])

  return (
    <main className="pt-32 pb-section px-6 md:px-12 max-w-container-max mx-auto">
      <FaqHeader onContactSupport={onContactSupport} />

      <FaqCategoryTabs
        categories={categories}
        activeId={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <FaqSidebar config={sidebar} onConciergeContact={onConciergeContact} />

        <div className="lg:col-span-8">
          {categoryGroups.length > 0 ? (
            categoryGroups.map((group) => (
              <FaqCategorySection key={group.id} group={group} />
            ))
          ) : (
            <p className="text-secondary font-body-md py-12 text-center">
              No questions found for this category yet.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
