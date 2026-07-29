import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAdminCustomers } from '@/hooks/useAdminCustomers'
import AdminTable from '@/components/shared/AdminTable'
import Pagination from '@/components/shared/Pagination'
import SearchInput from '@/components/shared/SearchInput'
import type { AdminCustomerListItem } from '@/types/admin'

export default function AdminCustomersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1) }, [])

  const { customers, meta, loading } = useAdminCustomers({ page, limit: 20, search: search || undefined })

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (c: AdminCustomerListItem) => (
        <div>
          <p className="font-medium text-gray-800">{c.name ?? 'No name'}</p>
          <p className="text-xs text-gray-400">{c.phone}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (c: AdminCustomerListItem) => (
        <span className="text-gray-600 text-sm">{c.email ?? '—'}</span>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (c: AdminCustomerListItem) => (
        <span className="font-semibold text-gray-800">{c.totalOrders}</span>
      ),
    },
    {
      key: 'spent',
      header: 'Lifetime Value',
      render: (c: AdminCustomerListItem) => (
        <span className="font-semibold text-gray-900">₹{c.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (c: AdminCustomerListItem) => (
        <span className="text-xs text-gray-500">{format(new Date(c.createdAt), 'dd MMM yyyy')}</span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{meta ? `${meta.total.toLocaleString()} customers` : ''}</p>
        <SearchInput value={search} onChange={handleSearch} placeholder="Search name or phone…" className="w-64" />
      </div>

      <AdminTable
        columns={columns}
        rows={customers}
        keyExtractor={(c) => c.id}
        loading={loading}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
      />

      {meta && (
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={20} onPageChange={setPage} />
      )}
    </div>
  )
}
