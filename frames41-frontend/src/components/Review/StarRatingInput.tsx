import { useState, useCallback, useId } from 'react'
import { MAX_RATING } from '../../constants/review'

interface StarRatingInputProps {
  readonly value: number
  readonly onChange: (rating: number) => void
  readonly max?: number
  readonly disabled?: boolean
}

export default function StarRatingInput({
  value,
  onChange,
  max = MAX_RATING,
  disabled = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0)
  const groupId = useId()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, star: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(star)
      }
    },
    [onChange],
  )

  const active = hovered || value

  return (
    <div role="group" aria-labelledby={groupId} className="flex gap-1">
      <span id={groupId} className="sr-only">
        Select a star rating from 1 to {max}
      </span>

      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        const filled = star <= active
        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} out of ${max} stars${value === star ? ' (selected)' : ''}`}
            aria-pressed={value === star}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className="transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span
              className="material-symbols-outlined select-none"
              aria-hidden="true"
              style={{
                fontSize: 32,
                color: filled ? '#800020' : '#E2E2DE',
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          </button>
        )
      })}
    </div>
  )
}
