import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import AdminTable from '@/components/shared/AdminTable'
import Pagination from '@/components/shared/Pagination'
import OrderFilters from '@/components/orders/OrderFilters'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import type { AdminOrderListItem, OrderStatus } from '@/types/admin'

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const resetPage = useCallback(() => setPage(1), [])

  const { orders, meta, loading } = useAdminOrders({
    page,
    limit: 20,
    status: status || undefined,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const handleSearch = (v: string) => { setSearch(v); resetPage() }
  const handleStatus = (v: OrderStatus | '') => { setStatus(v); resetPage() }
  const handleStart = (v: string) => { setStartDate(v); resetPage() }
  const handleEnd = (v: string) => { setEndDate(v); resetPage() }

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (o: AdminOrderListItem) => (
        <span className="font-mono text-xs font-semibold text-primary">{o.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o: AdminOrderListItem) => (
        <div>
          <p className="font-medium text-gray-800">{o.userName ?? '—'}</p>
          <p className="text-xs text-gray-400">{o.userPhone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: AdminOrderListItem) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'items',
      header: 'Items',
      render: (o: AdminOrderListItem) => (
        <span className="text-gray-600">{o.itemCount}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: AdminOrderListItem) => (
        <span className="font-semibold text-gray-900">₹{o.total.toLocaleString()}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (o: AdminOrderListItem) => (
        <span className="text-xs text-gray-500">
          {format(new Date(o.placedAt), 'dd MMM yyyy')}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {meta ? `${meta.total.toLocaleString()} orders` : ''}
        </p>
      </div>

      <OrderFilters
        search={search}
        onSearch={handleSearch}
        status={status}
        onStatus={handleStatus}
        startDate={startDate}
        endDate={endDate}
        onStartDate={handleStart}
        onEndDate={handleEnd}
      />

      <AdminTable
        columns={columns}
        rows={orders}
        keyExtractor={(o) => o.id}
        loading={loading}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
      />

      {meta && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={20}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
