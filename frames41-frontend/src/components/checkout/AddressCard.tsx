import type { KeyboardEvent } from 'react'
import type { ShippingAddress } from '../../types/checkout'

interface AddressCardProps {
  address: ShippingAddress
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
}

export default function AddressCard({ address, isSelected, onSelect, onEdit }: AddressCardProps) {
  const { id, label, fullName, line1, line2, city, state, zip, country } = address

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      className={[
        'relative flex flex-col justify-between min-h-[220px] p-lg bg-white rounded-2xl',
        'transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isSelected
          ? 'border-2 border-primary'
          : 'border border-[#E2E2DE] hover:border-[#111110]',
      ].join(' ')}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="bg-[#EEEEEC] text-[#111110] font-label-sm text-label-sm px-2 py-1 uppercase tracking-wider">
            {label}
          </span>
          {isSelected && (
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-label="Selected"
            />
          )}
        </div>

        <h3 className="font-label-bold text-label-bold text-[#111110] mb-2">{fullName}</h3>

        <address className="font-body-md text-body-md text-secondary not-italic">
          {line1}
          <br />
          {line2 && (
            <>
              {line2}
              <br />
            </>
          )}
          {city}, {state} {zip}
          <br />
          {country}
        </address>
      </div>

      <div className="mt-6 flex justify-between items-center">
        {isSelected ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(id)
            }}
            className="font-label-bold text-label-bold text-[#111110] hover:underline underline-offset-4 transition-all"
          >
            Edit Details
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(id)
              }}
              className="font-label-bold text-label-bold text-[#111110] hover:underline underline-offset-4"
            >
              Deliver here
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(id)
              }}
              className="font-label-bold text-label-bold text-[#8A8A85] hover:text-[#111110] transition-colors"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  )
}
