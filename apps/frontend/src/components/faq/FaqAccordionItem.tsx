import { useState } from 'react'
import Icon from '../ui/Icon'
import type { FaqItem } from '../../types/faq'

interface FaqAccordionItemProps {
  item: FaqItem
}

export default function FaqAccordionItem({ item }: FaqAccordionItemProps) {
  const [open, setOpen] = useState(false)

  const triggerId = `faq-trigger-${item.id}`
  const panelId = `faq-panel-${item.id}`

  return (
    <div className="border border-surface-container-highest bg-white hover:border-on-surface transition-colors">
      <button
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex justify-between items-center w-full p-6 text-left gap-4"
      >
        <span className="font-label-bold text-lg text-on-surface uppercase">
          {item.question}
        </span>
        <Icon
          name="add"
          className={[
            'flex-shrink-0 transition-transform duration-300',
            open ? 'rotate-45' : '',
          ].join(' ')}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-8 text-secondary font-body-md max-w-2xl">{item.answer}</p>
        </div>
      </div>
    </div>
  )
}
