import { useSearchParams } from 'react-router-dom'
import { useReviews } from '@/hooks/useReviews'
import Review from '@/components/review/Review'

export default function ReviewPage() {
  const [searchParams] = useSearchParams()
  const { reviews, products, loading, error, submitReview, deleteReview } = useReviews()
  const productId = searchParams.get('product') ?? undefined

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Review
      initialReviews={reviews}
      formProducts={products}
      initialProductId={productId}
      pageError={error}
      onSubmitReview={submitReview}
      onDeleteReview={deleteReview}
    />
  )
}
