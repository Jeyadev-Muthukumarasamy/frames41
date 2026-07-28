import type { ReferralEntry } from '../../types/refer'
import { formatINR } from '../../utils/format'
import ReferStatusBadge from './ReferStatusBadge'

interface ReferHistoryRowProps {
  entry: ReferralEntry
}

export default function ReferHistoryRow({ entry }: ReferHistoryRowProps) {
  const { name, date, status, rewardInr } = entry
  const isCompleted = status === 'completed'

  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <td className="px-8 py-6 font-body-md font-bold text-on-background">{name}</td>
      <td className="px-8 py-6 text-on-surface-variant">{date}</td>
      <td className="px-8 py-6">
        <ReferStatusBadge status={status} />
      </td>
      <td
        className={`px-8 py-6 text-right font-bold ${
          isCompleted ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        {isCompleted ? '+' : ''}{formatINR(rewardInr)}
      </td>
    </tr>
  )
}
