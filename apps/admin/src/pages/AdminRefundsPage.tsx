import { useState } from 'react'
import { format } from 'date-fns'
import { useAdminRefunds } from '@/hooks/useAdminRefunds'
import AdminTable from '@/components/shared/AdminTable'
import Pagination from '@/components/shared/Pagination'
import RefundActionModal from '@/components/refunds/RefundActionModal'
import type { AdminRefundListItem, RefundStatus } from '@/types/admin'

const STATUS_CONFIG: Record<RefundStatus, { label: string; className: string }> = {
  PENDING:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
}

export default function AdminRefundsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<RefundStatus | ''>('')
  const [selected, setSelected] = useState<AdminRefundListItem | null>(null)

  const { refunds, meta, loading, processRefund } = useAdminRefunds({
    page,
    limit: 20,
    status: statusFilter || undefined,
  })

  const columns = [
    {
      key: 'order',
      header: 'Order #',
      render: (r: AdminRefundListItem) => (
        <span className="font-mono text-xs font-semibold text-primary">{r.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r: AdminRefundListItem) => (
        <div>
          <p className="font-medium text-gray-800">{r.userName ?? '—'}</p>
          <p className="text-xs text-gray-400">{r.userPhone}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r: AdminRefundListItem) => (
        <span className="text-gray-600 max-w-xs truncate block">{r.reason}</span>
      ),
    },
    {
      key: 'video',
      header: 'Evidence',
      render: (r: AdminRefundListItem) =>
        r.videoUrl ? (
          <a
            href={r.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary underline"
          >
            View Video
          </a>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: AdminRefundListItem) => {
        const cfg = STATUS_CONFIG[r.status]
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'date',
      header: 'Requested',
      render: (r: AdminRefundListItem) => (
        <span className="text-xs text-gray-500">{format(new Date(r.requestedAt), 'dd MMM yyyy')}</span>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (r: AdminRefundListItem) =>
        r.status === 'PENDING' ? (
          <button
            onClick={(e) => { e.stopPropagation(); setSelected(r) }}
            className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Review
          </button>
        ) : null,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{meta ? `${meta.total.toLocaleString()} refund requests` : ''}</p>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as RefundStatus | ''); setPage(1) }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={refunds}
        keyExtractor={(r) => r.id}
        loading={loading}
      />

      {meta && (
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={20} onPageChange={setPage} />
      )}

      <RefundActionModal
        open={!!selected}
        refund={selected}
        onClose={() => setSelected(null)}
        onSubmit={processRefund}
      />
    </div>
  )
}
