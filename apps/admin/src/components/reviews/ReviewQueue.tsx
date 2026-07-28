import { format } from 'date-fns'
import type { AdminPendingReview } from '@/types/admin'

interface Props {
  reviews: AdminPendingReview[]
  loading: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </span>
  )
}

export default function ReviewQueue({ reviews, loading, onApprove, onReject }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">✅</span>
        <p className="text-base font-semibold text-gray-700">All caught up!</p>
        <p className="text-sm text-gray-400">No pending reviews to moderate.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <StarRating rating={r.rating} />
                <span className="text-xs font-semibold text-gray-700">{r.userName ?? 'Anonymous'}</span>
                {r.isVerified && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>
                )}
                <span className="text-xs text-gray-400">{format(new Date(r.createdAt), 'dd MMM yyyy')}</span>
              </div>
              <p className="text-xs text-primary font-medium mb-2">{r.productName}</p>
              {r.title && <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>}
              <p className="text-sm text-gray-600 line-clamp-3">{r.body}</p>
              {r.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {r.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={typeof img === 'string' ? img : (img as {url?: string}).url ?? ''} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => onApprove(r.id)}
                className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onReject(r.id)}
                className="px-4 py-2 text-sm font-semibold bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-400 rounded-xl transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
