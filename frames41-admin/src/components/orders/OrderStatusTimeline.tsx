import { format } from 'date-fns'
import type { OrderStatusHistoryEntry } from '@/types/admin'
import OrderStatusBadge from './OrderStatusBadge'

function safeFormatDate(value: string | Date | null | undefined) {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return format(d, 'dd MMM yyyy, h:mm a')
}

export default function OrderStatusTimeline({ history }: { history: OrderStatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-gray-400">No status history.</p>
  }

  return (
    <ol className="relative border-l border-gray-200 ml-3 space-y-6">
      {history.map((entry, i) => (
        <li key={i} className="ml-5">
          <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-primary" />
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <OrderStatusBadge status={entry.status} />
            {entry.changedAt && (
              <span className="text-xs text-gray-400">
                {safeFormatDate(entry.changedAt)}
              </span>
            )}
          </div>
          {entry.note && (
            <p className="text-sm text-gray-600 italic">&ldquo;{entry.note}&rdquo;</p>
          )}
        </li>
      ))}
    </ol>
  )
}
