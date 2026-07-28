import SearchInput from '@/components/shared/SearchInput'
import DateRangePicker from '@/components/shared/DateRangePicker'
import type { OrderStatus } from '@/types/admin'

const STATUSES: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

interface Props {
  search: string
  onSearch: (v: string) => void
  status: OrderStatus | ''
  onStatus: (v: OrderStatus | '') => void
  startDate: string
  endDate: string
  onStartDate: (v: string) => void
  onEndDate: (v: string) => void
}

export default function OrderFilters({
  search,
  onSearch,
  status,
  onStatus,
  startDate,
  endDate,
  onStartDate,
  onEndDate,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder="Search order # or customer…"
        className="w-64"
      />
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value as OrderStatus | '')}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartChange={onStartDate}
        onEndChange={onEndDate}
      />
    </div>
  )
}
