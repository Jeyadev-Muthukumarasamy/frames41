import type { ReviewItem } from '../../types/review'
import StarRating from './StarRating'

interface ReviewCardProps {
  readonly review: ReviewItem
  readonly onEdit?: (id: string) => void
  readonly onRemove?: (id: string) => void
}

export default function ReviewCard({ review, onEdit, onRemove }: ReviewCardProps) {
  const isPending = review.status === 'pending'

  return (
    <article
      aria-label={`Review for ${review.productName}${isPending ? ', pending approval' : ''}`}
      className={`border p-md flex flex-col md:flex-row gap-md transition-opacity rounded-2xl ${
        isPending
          ? 'bg-surface-variant border-dashed border-outline-variant opacity-70'
          : 'bg-surface border-outline-variant'
      }`}
    >
      <div
        className={`w-full md:w-32 h-32 flex-shrink-0 overflow-hidden bg-[#E9E8E2] rounded-xl ${
          isPending ? 'grayscale' : ''
        }`}
      >
        <img
          src={review.productImage}
          alt={review.productImageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start gap-sm mb-xs">
          <div>
            {isPending && (
              <span
                className="inline-block bg-on-background text-on-primary text-[10px] font-bold px-2 py-0.5 mb-1 uppercase tracking-wider"
                aria-label="This review is pending approval"
              >
                Pending Approval
              </span>
            )}
            <h3 className="font-label-bold text-label-bold text-on-surface">{review.productName}</h3>
            {!isPending && (
              <div className="mt-1">
                <StarRating rating={review.rating} size="sm" />
              </div>
            )}
          </div>

          {review.isoDate ? (
            <time
              dateTime={review.isoDate}
              className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest flex-shrink-0"
            >
              {review.displayDate}
            </time>
          ) : (
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest flex-shrink-0">
              {review.displayDate}
            </span>
          )}
        </div>

        <blockquote className="font-body-md text-body-md text-on-surface-variant italic mb-sm">
          <p>"{review.reviewText}"</p>
        </blockquote>

        {!isPending && (onEdit || onRemove) && (
          <div className="flex gap-md" role="group" aria-label={`Actions for ${review.productName} review`}>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review.id)}
                className="font-label-bold text-label-sm text-on-surface underline decoration-primary underline-offset-4 hover:opacity-70 transition-opacity"
              >
                Edit Review
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(review.id)}
                aria-label={`Remove review for ${review.productName}`}
                className="font-label-bold text-label-sm text-on-surface underline decoration-outline-variant underline-offset-4 hover:opacity-70 transition-opacity"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
