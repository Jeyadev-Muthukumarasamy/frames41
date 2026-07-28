import type { ReactNode } from 'react'
import type { PaymentMethod, PaymentMethodId } from '../../types/payment'
import Icon from '../ui/Icon'

interface PaymentMethodOptionProps {
  method: PaymentMethod
  isSelected: boolean
  onSelect: (id: PaymentMethodId) => void
  children?: ReactNode
}

export default function PaymentMethodOption({
  method,
  isSelected,
  onSelect,
  children,
}: PaymentMethodOptionProps) {
  const handleSelect = () => {
    if (!isSelected) onSelect(method.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={[
        'relative bg-surface-container-lowest border-2 p-lg rounded-lg cursor-pointer',
        'transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary'
          : 'border-surface-container-highest hover:border-outline-variant',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Icon
            name={method.icon}
            className={`text-[28px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}
          />
          <div>
            <h3 className="font-label-bold text-on-surface">{method.label}</h3>
            <p className="font-label-sm text-on-surface-variant">{method.description}</p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={[
            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
            isSelected
              ? 'border-4 border-primary'
              : 'border-2 border-surface-container-highest',
          ].join(' ')}
        >
          {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
        </span>
      </div>

      {isSelected && children && (
        <div
          className="mt-lg pt-lg border-t border-surface-container-highest"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          {children}
        </div>
      )}
    </div>
  )
}
