import { useState, useCallback } from 'react'
import type { ReviewFormData, ReviewFormProduct, ReviewItem } from '../../types/review'
import { REVIEW_ITEMS } from '../../constants/review'
import ReviewList from './ReviewList'
import WriteReviewForm from './WriteReviewForm'
import Icon from '../ui/Icon'

interface ReviewProps {
  initialReviews?: ReviewItem[]
  formProducts?: ReadonlyArray<ReviewFormProduct>
  initialProductId?: string
  pageError?: string | null
  onSubmitReview?: (data: ReviewFormData) => Promise<void>
  onDeleteReview?: (id: string) => Promise<void>
}

export default function Review({ initialReviews, formProducts = [], initialProductId, pageError, onSubmitReview, onDeleteReview }: ReviewProps = {}) {
  const [reviews, setReviews] = useState(initialReviews ?? REVIEW_ITEMS)

  const handleRemove = useCallback(async (id: string) => {
    if (onDeleteReview) {
      await onDeleteReview(id)
    }
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }, [onDeleteReview])

  const handleEdit = useCallback((_id: string) => {
    // TODO: open edit modal
  }, [])

  const handleSubmit = useCallback(async (data: ReviewFormData): Promise<void> => {
    if (onSubmitReview) {
      await onSubmitReview(data)
      return
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1000))
  }, [onSubmitReview])

  return (
    <main
      id="reviews-content"
      className="pt-32 pb-xl px-6 md:px-gutter max-w-container mx-auto w-full"
    >
      <header className="mb-md text-center md:text-left">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">My Reviews</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Manage your feedback, share your experience with the community, and help us refine our
          handcrafted essentials.
        </p>
      </header>

      {pageError && (
        <div className="mb-md p-md border border-error bg-error/5 text-error flex items-start gap-sm">
          <Icon name="error" className="shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-label-bold text-label-bold">Something went wrong</p>
            <p className="font-body-sm text-body-sm mt-xs">{pageError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        <ReviewList reviews={reviews} onEdit={handleEdit} onRemove={handleRemove} />
        <WriteReviewForm products={formProducts} onSubmit={handleSubmit} initialProductId={initialProductId} />
      </div>
    </main>
  )
}
