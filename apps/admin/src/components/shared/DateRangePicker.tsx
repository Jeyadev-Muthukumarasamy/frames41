interface Props {
  startDate: string
  endDate: string
  onStartChange: (val: string) => void
  onEndChange: (val: string) => void
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-600 pl-1">Start Date:</span>
        <input
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => onStartChange(e.target.value)}
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
          onChange={(e) => onEndChange(e.target.value)}
          className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
        />
      </div>
      {(startDate || endDate) && (
        <button
          type="button"
          onClick={() => {
            onStartChange('')
            onEndChange('')
          }}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors font-semibold"
        >
          Clear
        </button>
      )}
    </div>
  )
}
