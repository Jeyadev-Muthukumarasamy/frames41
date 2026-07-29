import FaqAccordionItem from './FaqAccordionItem'
import type { FaqCategoryGroup } from '../../types/faq'

interface FaqCategorySectionProps {
  group: FaqCategoryGroup
}

export default function FaqCategorySection({ group }: FaqCategorySectionProps) {
  return (
    <section aria-labelledby={`faq-section-${group.id}`} className="mb-12">
      <h2
        id={`faq-section-${group.id}`}
        className="font-headline-md text-on-surface mb-8 pb-2 border-b-2 border-primary w-fit"
      >
        {group.heading}
      </h2>

      <ul role="list" className="space-y-2 list-none p-0 m-0">
        {group.items.map((item) => (
          <li key={item.id}>
            <FaqAccordionItem item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}
