import type { Period } from '@/types/admin'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

interface Props {
  value: Period
  onChange: (p: Period) => void
  startDate: string
  endDate: string
  onStartDate: (v: string) => void
  onEndDate: (v: string) => void
}

export default function PeriodSelector({
  value,
  onChange,
  startDate,
  endDate,
  onStartDate,
  onEndDate,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              value === p.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-600 pl-1">Start Date:</span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => onStartDate(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
            />
          </div>
          <span className="text-gray-400 text-xs font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-600">End Date:</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => onEndDate(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                onStartDate('')
                onEndDate('')
              }}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors font-semibold ml-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </div>
  )
}
