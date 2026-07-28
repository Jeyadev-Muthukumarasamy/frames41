import { useState } from 'react'
import { useAdminCategories } from '@/hooks/useAdminCategories'
import CategoryTree from '@/components/categories/CategoryTree'
import CategoryForm from '@/components/categories/CategoryForm'
import ConfirmModal from '@/components/shared/ConfirmModal'
import type { AdminCategory, CategoryFormData } from '@/types/admin'

export default function AdminCategoriesPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useAdminCategories()
  const [editing, setEditing] = useState<AdminCategory | null | 'new'>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleSubmit = async (data: CategoryFormData) => {
    if (editing === 'new') {
      await createCategory(data)
    } else if (editing) {
      await updateCategory(editing.id, data)
    }
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteCategory(deleting.id)
      setDeleting(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage your category hierarchy</p>
        <button
          onClick={() => setEditing('new')}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
        >
          + New Category
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <CategoryTree
          categories={categories}
          onEdit={(cat) => setEditing(cat)}
          onDelete={(cat) => setDeleting(cat)}
        />
      )}

      {/* Form modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-5">
              {editing === 'new' ? 'New Category' : `Edit: ${editing.name}`}
            </h3>
            <CategoryForm
              initial={editing === 'new' ? null : editing}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleting}
        title="Delete Category"
        message={
          deleting?.children?.length
            ? `"${deleting.name}" has ${deleting.children.length} sub-categories. Deletion may be blocked by the API.`
            : `Delete "${deleting?.name}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleting(null); setDeleteError('') }}
        loading={deleteLoading}
      />
      {deleteError && (
        <p className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg z-50">
          {deleteError}
        </p>
      )}
    </div>
  )
}
