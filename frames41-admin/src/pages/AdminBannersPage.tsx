import { useState } from 'react'
import { useAdminBanners } from '@/hooks/useAdminBanners'
import BannerGrid from '@/components/banners/BannerGrid'
import BannerForm from '@/components/banners/BannerForm'
import ConfirmModal from '@/components/shared/ConfirmModal'
import type { AdminBanner, BannerFormData } from '@/types/admin'

export default function AdminBannersPage() {
  const { banners, loading, error, createBanner, updateBanner, deleteBanner, toggleActive } = useAdminBanners()
  const [editing, setEditing] = useState<AdminBanner | null | 'new'>(null)
  const [deleting, setDeleting] = useState<AdminBanner | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSubmit = async (data: BannerFormData) => {
    if (editing === 'new') {
      await createBanner(data)
    } else if (editing) {
      await updateBanner(editing.id, data)
    }
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await deleteBanner(deleting.id)
      setDeleting(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{banners.length} banners across all types</p>
        <button
          onClick={() => setEditing('new')}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
        >
          + New Banner
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <BannerGrid
          banners={banners}
          onEdit={(b) => setEditing(b)}
          onDelete={(b) => setDeleting(b)}
          onToggle={(b) => toggleActive(b.id, b.isActive)}
        />
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-5">
              {editing === 'new' ? 'New Banner' : `Edit Banner`}
            </h3>
            <BannerForm
              initial={editing === 'new' ? null : editing}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Delete Banner"
        message={`Delete this banner? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  )
}
