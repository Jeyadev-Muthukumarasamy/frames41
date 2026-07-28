import Icon from '../ui/Icon'

interface ReferStatCardProps {
  icon: string
  label: string
  value: string
  variant?: 'light' | 'dark'
}

const VARIANT_STYLES = {
  light: {
    card: 'bg-surface-container-lowest border border-outline-variant',
    label: 'text-on-surface-variant',
    value: 'text-on-background',
    icon: 'text-primary',
  },
  dark: {
    card: 'bg-on-background',
    label: 'text-on-surface-variant/60',
    value: 'text-surface',
    icon: 'text-primary',
  },
} as const

export default function ReferStatCard({
  icon,
  label,
  value,
  variant = 'light',
}: ReferStatCardProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <div className={`${styles.card} p-8 flex flex-col justify-between min-h-[200px]`}>
      <Icon name={icon} className={`${styles.icon} text-[32px]`} aria-hidden />
      <div>
        <p className={`text-label-sm font-label-bold ${styles.label} uppercase tracking-widest`}>
          {label}
        </p>
        <p className={`text-headline-lg font-headline-lg ${styles.value}`}>{value}</p>
      </div>
    </div>
  )
}
