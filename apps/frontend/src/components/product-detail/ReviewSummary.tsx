import type { ProductReviews } from '../../types/productDetail'
import StarRating from '../review/StarRating'

interface RatingBarProps {
  stars: number
  percentage: number
}

function RatingBar({ stars, percentage }: RatingBarProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <span aria-hidden="true" className="text-xs font-bold w-4 text-on-background shrink-0">
        {stars}
      </span>
      <div
        role="meter"
        aria-label={`${stars}-star reviews: ${percentage}%`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface ReviewSummaryProps {
  reviews: ProductReviews
  onWriteReview?: () => void
}

export default function ReviewSummary({ reviews, onWriteReview }: ReviewSummaryProps) {
  return (
    <aside
      className="bg-white p-6 sm:p-8 rounded-xl border border-outline-variant shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] self-start"
      aria-label="Review summary"
    >
      <h3 className="text-lg sm:text-headline-md font-headline font-bold text-on-background mb-4 sm:mb-6">Reviews</h3>

      <div className="flex items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
        <span className="text-4xl sm:text-6xl font-headline font-bold text-on-background leading-none">
          {reviews.average}
        </span>
        <div className="pb-1 flex flex-col gap-1">
          <StarRating rating={reviews.average} />
          <p className="text-xs text-outline font-bold uppercase tracking-widest">
            {reviews.count} Verified Reviews
          </p>
        </div>
      </div>

      <div className="space-y-3" aria-label="Rating breakdown">
        {reviews.breakdown.map(({ stars, percentage }) => (
          <RatingBar key={stars} stars={stars} percentage={percentage} />
        ))}
      </div>

      <button
        type="button"
        onClick={onWriteReview}
        className="w-full mt-6 sm:mt-8 border border-on-background py-3 sm:py-4 rounded font-bold uppercase tracking-widest hover:bg-on-background hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-on-background text-sm sm:text-base"
      >
        Write a Review
      </button>
    </aside>
  )
}
