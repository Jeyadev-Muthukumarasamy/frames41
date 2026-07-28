const SIZES = { sm: 16, md: 18, lg: 24 } as const

interface StarRatingProps {
  readonly rating: number
  readonly max?: number
  readonly size?: keyof typeof SIZES
}

export default function StarRating({ rating, max = 5, size = 'md' }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(max, Math.round(rating)))
  const px = SIZES[size]

  return (
    <div
      role="img"
      aria-label={`${clamped} out of ${max} stars`}
      className="flex gap-0.5 text-primary"
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="material-symbols-outlined select-none"
          aria-hidden="true"
          style={{
            fontSize: px,
            fontVariationSettings: i < clamped ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}
