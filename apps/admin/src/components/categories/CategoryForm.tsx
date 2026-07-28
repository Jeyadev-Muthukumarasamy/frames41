import { useState, useEffect, useRef } from 'react'
import type { AdminCategory, CategoryFormData } from '@/types/admin'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

interface Props {
  initial?: AdminCategory | null
  categories: AdminCategory[]
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
}

const EMPTY: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  parentId: null,
  sortOrder: 0,
  isActive: true,
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const INPUT = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'

export default function CategoryForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CategoryFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (!initial) return
    setForm({
      name: initial.name,
      slug: initial.slug,
      description: initial.description ?? '',
      imageUrl: initial.imageUrl ?? '',
      parentId: initial.parentId ?? null,
      sortOrder: initial.sortOrder,
      isActive: initial.isActive,
    })
  }, [initial])

  const set = <K extends keyof CategoryFormData>(k: K, v: CategoryFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const { url } = await api.admin.uploadImage(file)
      set('imageUrl', url)
      addToast('Category image uploaded successfully!', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      setError(message)
      addToast(message, 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const flat: AdminCategory[] = []
  const flatten = (cats: AdminCategory[], depth = 0) => {
    cats.forEach((c) => {
      flat.push({ ...c, name: '  '.repeat(depth) + c.name })
      if (c.children?.length) flatten(c.children, depth + 1)
    })
  }
  flatten(categories)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
          <input
            value={form.name}
            onChange={(e) => { set('name', e.target.value); if (!initial) set('slug', slugify(e.target.value)) }}
            required className={INPUT}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Parent Category</label>
          <select
            value={form.parentId ?? ''}
            onChange={(e) => set('parentId', e.target.value || null)}
            className={INPUT}
          >
            <option value="">None (top-level)</option>
            {flat.filter((c) => c.id !== initial?.id).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
          <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} className={INPUT} />
        </div>
        <div className="sm:col-span-2 [&>input]:hidden">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Category Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          {form.imageUrl ? (
            <div className="relative w-full max-w-sm aspect-[16/9] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src={form.imageUrl}
                alt="Category preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : 'Replace'}
                </button>
                <button
                  type="button"
                  onClick={() => set('imageUrl', '')}
                  disabled={uploading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60"
            >
              {uploading ? 'Uploading image…' : '+ Upload Category Image'}
            </button>
          )}
          <input value={form.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value)} className={INPUT} placeholder="https://…" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={3} className={`${INPUT} resize-none`} />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <span className="text-sm text-gray-700 font-medium">Active</span>
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading || uploading} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-60">
          {loading ? 'Saving…' : initial ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </form>
  )
}
