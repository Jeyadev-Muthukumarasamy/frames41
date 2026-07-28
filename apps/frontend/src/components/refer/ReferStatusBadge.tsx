import type { ReferralStatus } from '../../types/refer'

interface ReferStatusBadgeProps {
  status: ReferralStatus
}

const BADGE_STYLES: Record<ReferralStatus, string> = {
  completed: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
}

const BADGE_LABELS: Record<ReferralStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
}

export default function ReferStatusBadge({ status }: ReferStatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 text-xs font-label-bold uppercase tracking-wider ${BADGE_STYLES[status]}`}
    >
      {BADGE_LABELS[status]}
    </span>
  )
}
