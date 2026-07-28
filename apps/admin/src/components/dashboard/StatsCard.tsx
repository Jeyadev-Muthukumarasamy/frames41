interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  loading?: boolean
}

export default function StatsCard({ label, value, sub, accent = false, loading = false }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="h-3.5 w-24 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="h-7 w-32 bg-gray-100 rounded animate-pulse mb-1.5" />
        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm ${accent ? 'border-primary/20' : 'border-gray-100'}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-gray-900'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
