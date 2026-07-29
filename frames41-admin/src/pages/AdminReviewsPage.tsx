import { useState } from 'react'
import { useAdminReviews } from '@/hooks/useAdminReviews'
import ReviewQueue from '@/components/reviews/ReviewQueue'
import Pagination from '@/components/shared/Pagination'

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1)
  const { reviews, meta, loading, error, approveReview, rejectReview } = useAdminReviews({ page, limit: 20 })

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {meta ? `${meta.total} pending review${meta.total !== 1 ? 's' : ''} awaiting moderation` : ''}
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <ReviewQueue
        reviews={reviews}
        loading={loading}
        onApprove={approveReview}
        onReject={rejectReview}
      />

      {meta && (
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={20} onPageChange={setPage} />
      )}
    </div>
  )
}
