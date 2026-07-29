import type { MouseEvent } from 'react'
import type { ProfileAddress } from '../../types/profile'

interface ProfileAddressCardProps {
  address: ProfileAddress
  onEdit: (id: string) => void
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
}

function stopPropagationAnd(e: MouseEvent<HTMLButtonElement>, fn: () => void) {
  e.stopPropagation()
  fn()
}

export default function ProfileAddressCard({
  address,
  onEdit,
  onRemove,
  onSetDefault,
}: ProfileAddressCardProps) {
  const { id, label, fullName, line1, line2, city, state, zip, country, isDefault } = address

  return (
    <article
      className={[
        'bg-white p-8 flex flex-col justify-between h-full relative rounded-2xl',
        isDefault
          ? 'border-2 border-[#111110]'
          : 'border border-[#E2E2DE] hover:border-[#111110] transition-colors group',
      ].join(' ')}
      aria-label={`${label} address${isDefault ? ', default' : ''}`}
    >
      {isDefault && (
        <span
          className="absolute top-4 right-4 bg-[#111110] text-white text-[10px] px-2 py-1 font-label-bold uppercase tracking-widest"
          aria-label="Default address"
        >
          Default
        </span>
      )}

      <div>
        <h3
          className={[
            'font-label-bold text-label-bold uppercase mb-4 tracking-widest',
            isDefault ? 'text-[#111110]' : 'text-[#8A8A85] group-hover:text-[#111110]',
          ].join(' ')}
        >
          {label}
        </h3>

        <address className="not-italic">
          <p className="font-body-md text-[#111110] mb-1">{fullName}</p>
          {line1 && <p className="font-body-md text-[#5f5e5d]">{line1}</p>}
          {line2 && <p className="font-body-md text-[#5f5e5d]">{line2}</p>}
          <p className="font-body-md text-[#5f5e5d]">
            {city}, {state} {zip}
          </p>
          <p className="font-body-md text-[#5f5e5d]">{country}</p>
        </address>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E2E2DE] flex gap-6 items-center">
        <button
          type="button"
          onClick={(e) => stopPropagationAnd(e, () => onEdit(id))}
          className="font-label-bold text-label-bold uppercase text-[#111110] hover:text-[#800020] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => stopPropagationAnd(e, () => onRemove(id))}
          className="font-label-bold text-label-bold uppercase text-[#8A8A85] hover:text-error transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Remove ${label} address`}
        >
          Remove
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={(e) => stopPropagationAnd(e, () => onSetDefault(id))}
            className="ml-auto font-label-bold text-label-bold uppercase text-[#8A8A85] hover:text-[#111110] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Set ${label} as default address`}
          >
            Set as Default
          </button>
        )}
      </div>
    </article>
  )
}
