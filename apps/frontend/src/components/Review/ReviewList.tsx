import type { ReviewItem } from '../../types/review'
import ReviewCard from './ReviewCard'

interface ReviewListProps {
  readonly reviews: ReadonlyArray<ReviewItem>
  readonly onEdit?: (id: string) => void
  readonly onRemove?: (id: string) => void
}

export default function ReviewList({ reviews, onEdit, onRemove }: ReviewListProps) {
  return (
    <section className="lg:col-span-7 flex flex-col gap-md" aria-label="Your review history">
      <h2 className="font-headline-md text-headline-md border-b border-outline-variant pb-sm">
        Recent Activity
      </h2>

      {reviews.length === 0 ? (
        <p className="font-body-md text-on-surface-variant py-lg text-center" role="status">
          You haven't written any reviews yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-md list-none m-0 p-0" role="list">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} onEdit={onEdit} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
