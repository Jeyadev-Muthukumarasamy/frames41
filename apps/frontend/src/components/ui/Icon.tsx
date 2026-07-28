interface IconProps {
  name: string
  className?: string
  filled?: boolean
  'aria-label'?: string
}

export default function Icon({ name, className = '', filled = false, 'aria-label': ariaLabel }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      {name}
    </span>
  )
}
