import { useState, useEffect, useRef } from 'react'
import type { AdminBanner, BannerFormData, BannerType } from '@/types/admin'
import { BANNER_TYPE_LABELS } from '@/types/admin'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

const TYPES = Object.entries(BANNER_TYPE_LABELS) as [BannerType, string][]
const INPUT = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'

const EMPTY: BannerFormData = {
  type: 'HEADER_SLIDER',
  title: '',
  subtitle: '',
  imageUrl: '',
  mobileImageUrl: '',
  link: '',
  sortOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
}

interface Props {
  initial?: AdminBanner | null
  onSubmit: (data: BannerFormData) => Promise<void>
  onCancel: () => void
}

export default function BannerForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<BannerFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<'imageUrl' | 'mobileImageUrl' | null>(null)
  const [error, setError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mobileImageInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (!initial) return
    setForm({
      type: initial.type,
      title: initial.title ?? '',
      subtitle: initial.subtitle ?? '',
      imageUrl: initial.imageUrl,
      mobileImageUrl: initial.mobileImageUrl ?? '',
      link: initial.link ?? '',
      sortOrder: initial.sortOrder,
      isActive: initial.isActive,
      startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
      endDate: initial.endDate ? initial.endDate.slice(0, 10) : '',
    })
  }, [initial])

  const set = <K extends keyof BannerFormData>(k: K, v: BannerFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.imageUrl) {
      setError('A banner image is required')
      return
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date must be after start date')
      return
    }
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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageUrl' | 'mobileImageUrl',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(field)
    setError('')
    try {
      const { url } = await api.admin.uploadImage(file)
      set(field, url)
      addToast(
        field === 'imageUrl'
          ? 'Banner image uploaded successfully!'
          : 'Mobile banner image uploaded successfully!',
        'success',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      setError(message)
      addToast(message, 'error')
    } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value as BannerType)} className={INPUT}>
            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
          <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} className={INPUT} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Banner Image *</label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleImageUpload(e, 'imageUrl')}
            className="hidden"
          />
          {form.imageUrl ? (
            <div className="relative aspect-[16/6] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img src={form.imageUrl} alt="Banner preview" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading !== null} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm disabled:opacity-60">
                  {uploading === 'imageUrl' ? 'Uploading…' : 'Replace'}
                </button>
                <button type="button" onClick={() => set('imageUrl', '')} disabled={uploading !== null} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading !== null} className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60">
              {uploading === 'imageUrl' ? 'Uploading image…' : '+ Upload Banner Image'}
            </button>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Mobile Banner Image</label>
          <input
            ref={mobileImageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleImageUpload(e, 'mobileImageUrl')}
            className="hidden"
          />
          {form.mobileImageUrl ? (
            <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img src={form.mobileImageUrl} alt="Mobile banner preview" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <button type="button" onClick={() => mobileImageInputRef.current?.click()} disabled={uploading !== null} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm disabled:opacity-60">
                  {uploading === 'mobileImageUrl' ? 'Uploading…' : 'Replace'}
                </button>
                <button type="button" onClick={() => set('mobileImageUrl', '')} disabled={uploading !== null} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => mobileImageInputRef.current?.click()} disabled={uploading !== null} className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60">
              {uploading === 'mobileImageUrl' ? 'Uploading image…' : '+ Upload Mobile Image (Optional)'}
            </button>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
          <input value={form.subtitle ?? ''} onChange={(e) => set('subtitle', e.target.value)} className={INPUT} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
          <input type="url" value={form.link ?? ''} onChange={(e) => set('link', e.target.value)} className={INPUT} placeholder="https://frames41.com/products" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" value={form.startDate ?? ''} max={form.endDate || undefined} onChange={(e) => set('startDate', e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" value={form.endDate ?? ''} min={form.startDate || undefined} onChange={(e) => set('endDate', e.target.value)} className={INPUT} />
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
        <button type="submit" disabled={loading || uploading !== null} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-60">
          {loading ? 'Saving…' : initial ? 'Save Changes' : 'Create Banner'}
        </button>
      </div>
    </form>
  )
}
