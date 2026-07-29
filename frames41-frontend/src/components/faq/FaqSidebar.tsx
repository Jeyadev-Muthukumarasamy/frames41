import Icon from '../ui/Icon'
import type { FaqSidebarConfig } from '../../types/faq'

interface FaqSidebarProps {
  config: FaqSidebarConfig
  onConciergeContact?: () => void
}

export default function FaqSidebar({ config, onConciergeContact }: FaqSidebarProps) {
  const { workshopImageUrl, workshopImageAlt, conciergeHref } = config

  return (
    <aside aria-label="Support options" className="lg:col-span-4 space-y-6">
      <div className="p-8 bg-surface-container-low border border-surface-container-highest relative overflow-hidden">
        <h3 className="font-headline-md text-on-surface mb-4">
          Can't find what you're looking for?
        </h3>
        <p className="text-body-md text-secondary mb-6">
          Our dedicated concierge team is available Monday through Friday to assist with specialized
          inquiries or bespoke consultations.
        </p>
        <a
          href={conciergeHref}
          rel="noopener noreferrer"
          onClick={onConciergeContact}
          className="inline-flex items-center gap-2 font-label-bold text-primary hover:gap-4 transition-all uppercase tracking-widest"
        >
          Email Concierge
          <Icon name="arrow_forward" className="text-[18px]" />
        </a>
      </div>

      <div className="relative h-64 overflow-hidden border border-surface-container-highest">
        <img
          src={workshopImageUrl}
          alt={workshopImageAlt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      </div>
    </aside>
  )
}
