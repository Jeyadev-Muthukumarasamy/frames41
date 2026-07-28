import { useState } from 'react'
import type { AdminRefundListItem, RefundStatus } from '@/types/admin'

interface Props {
  open: boolean
  refund: AdminRefundListItem | null
  onClose: () => void
  onSubmit: (id: string, status: RefundStatus, note?: string) => Promise<void>
}

export default function RefundActionModal({ open, refund, onClose, onSubmit }: Props) {
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | ''>('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action || !refund) return
    setLoading(true)
    setError('')
    try {
      await onSubmit(refund.id, action, note || undefined)
      onClose()
      setAction('')
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open || !refund) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Process Refund</h3>
        <p className="text-xs text-gray-500 mb-5">Order #{refund.orderNumber}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1.5">
          <p><span className="text-gray-500">Customer:</span> <span className="font-medium">{refund.userName ?? refund.userPhone}</span></p>
          <p><span className="text-gray-500">Reason:</span> <span className="font-medium">{refund.reason}</span></p>
          {refund.videoUrl && (
            <p>
              <span className="text-gray-500">Evidence:</span>{' '}
              <a href={refund.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                View Video
              </a>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction('APPROVED')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                action === 'APPROVED'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-green-300'
              }`}
            >
              ✓ Approve
            </button>
            <button
              type="button"
              onClick={() => setAction('REJECTED')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                action === 'REJECTED'
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              ✕ Reject
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Admin Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for the customer…"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!action || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
