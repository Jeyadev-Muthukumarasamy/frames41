import type { KeyboardEvent } from 'react'
import type { ProfileNavItem, ProfileSection } from '../../types/profile'

interface ProfileSidebarNavProps {
  items: ReadonlyArray<ProfileNavItem>
  activeSection: ProfileSection
  onSelect: (section: ProfileSection) => void
}

export default function ProfileSidebarNav({
  items,
  activeSection,
  onSelect,
}: ProfileSidebarNavProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, id: ProfileSection) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <nav aria-label="Profile sections" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.id === activeSection
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={[
              'w-full px-4 py-3 font-label-bold text-label-bold flex items-center justify-between',
              'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive
                ? 'bg-white border border-[#111110] text-[#111110]'
                : 'border border-[#E2E2DE] text-[#8A8A85] hover:border-[#111110] hover:text-[#111110]',
            ].join(' ')}
          >
            <span>{item.label}</span>
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              chevron_right
            </span>
          </button>
        )
      })}
    </nav>
  )
}
