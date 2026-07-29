import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (awbCode: string, trackingUrl?: string) => Promise<void>
  existing?: { awbCode: string; trackingUrl?: string }
}

export default function TrackingModal({ open, onClose, onSubmit, existing }: Props) {
  const [awbCode, setAwbCode] = useState(existing?.awbCode ?? '')
  const [trackingUrl, setTrackingUrl] = useState(existing?.trackingUrl ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!awbCode.trim()) { setError('AWB code is required'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit(awbCode.trim(), trackingUrl.trim() || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tracking')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10">
        <h3 className="text-base font-semibold text-gray-900 mb-5">
          {existing ? 'Update Tracking' : 'Add Tracking'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">AWB Code *</label>
            <input
              value={awbCode}
              onChange={(e) => setAwbCode(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. 1234567890"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tracking URL</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="https://track.delhivery.com/…"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
