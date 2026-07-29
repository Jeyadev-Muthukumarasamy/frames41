interface Props {
  startDate: string
  endDate: string
  onStartChange: (val: string) => void
  onEndChange: (val: string) => void
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        max={endDate || undefined}
        onChange={(e) => onStartChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <span className="text-gray-400 text-sm">→</span>
      <input
        type="date"
        value={endDate}
        min={startDate || undefined}
        onChange={(e) => onEndChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  )
}
