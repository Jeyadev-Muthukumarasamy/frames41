import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { adaptReviewItem, adaptReviewFormProduct } from '@/lib/adapters'
import type { ReviewItem, ReviewFormData, ReviewFormProduct } from '@/types/review'

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [products, setProducts] = useState<ReviewFormProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      setError(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await api.reviews.getUserReviews() as any[]
      setReviews(raw.map(adaptReviewItem))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load your reviews.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.products.getProducts({ limit: 100, isActive: true }).then((res: any) => {
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      setProducts(list.map(adaptReviewFormProduct))
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to load products.'
      toast.error(message)
    })
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const submitReview = useCallback(async (data: ReviewFormData) => {
    try {
      await api.reviews.create({
        productId: data.productId,
        rating: data.rating,
        body: data.reviewText,
      })
      toast.success('Review submitted successfully!')
      await fetchReviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review.'
      toast.error(message)
      throw err
    }
  }, [fetchReviews])

  const deleteReview = useCallback(async (id: string) => {
    try {
      await api.reviews.delete(id)
      toast.success('Review deleted.')
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete review.'
      toast.error(message)
      throw err
    }
  }, [])

  const updateReview = useCallback(async (id: string, data: Partial<ReviewFormData>) => {
    try {
      await api.reviews.update(id, {
        rating: data.rating,
        body: data.reviewText,
      })
      toast.success('Review updated.')
      await fetchReviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update review.'
      toast.error(message)
      throw err
    }
  }, [fetchReviews])

  return { reviews, products, loading, error, submitReview, deleteReview, updateReview }
}
