import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import AdminTable from '@/components/shared/AdminTable'
import Pagination from '@/components/shared/Pagination'
import SearchInput from '@/components/shared/SearchInput'
import ConfirmModal from '@/components/shared/ConfirmModal'
import type { AdminProductListItem } from '@/types/admin'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminProductListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1) }, [])

  const { products, meta, loading, deleteProduct, toggleActive } = useAdminProducts({
    page, limit: 20,
    search: search || undefined,
    lowStock: lowStock || undefined,
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p: AdminProductListItem) => (
        <div className="flex items-center gap-3">
          {p.imageUrls?.[0] && (
            <img src={p.imageUrls[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium text-gray-800 max-w-xs truncate">{p.name}</p>
            {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p: AdminProductListItem) => (
        <div>
          {p.discountedPrice ? (
            <>
              <span className="font-semibold text-gray-900">₹{p.discountedPrice.toLocaleString()}</span>
              <span className="text-xs text-gray-400 line-through ml-1">₹{p.basePrice.toLocaleString()}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-900">₹{p.basePrice.toLocaleString()}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p: AdminProductListItem) => (
        <span className={`font-semibold ${p.stock <= 10 ? 'text-red-600' : 'text-gray-800'}`}>
          {p.stock <= 10 && '⚠ '}
          {p.stock}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: AdminProductListItem) => (
        <span className="text-sm text-gray-600">{p.categoryName ?? '—'}</span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (p: AdminProductListItem) => (
        <div className="flex flex-wrap gap-1">
          <span className={`px-2 py-0.5 rounded-full text-xs ${Object.keys(p.specifications ?? {}).length ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
            {Object.keys(p.specifications ?? {}).length} specs
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${p.careInstructions ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
            {p.careInstructions ? 'Care added' : 'No care'}
          </span>
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Active',
      render: (p: AdminProductListItem) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleActive(p.id, p.isActive) }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${p.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (p: AdminProductListItem) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/products/${p.id}/edit`)}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search products…" className="w-56" />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => { setLowStock(e.target.checked); setPage(1) }}
              className="w-4 h-4 text-primary border-gray-300 rounded"
            />
            Low stock only
          </label>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
        >
          + New Product
        </button>
      </div>

      <AdminTable
        columns={columns}
        rows={products}
        keyExtractor={(p) => p.id}
        loading={loading}
        onRowClick={(p) => navigate(`/products/${p.id}/edit`)}
      />

      {meta && (
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={20} onPageChange={setPage} />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  )
}
