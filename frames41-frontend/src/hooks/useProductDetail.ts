import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { adaptProductDetail, adaptRelatedProduct } from '@/lib/adapters'
import type { ProductData } from '@/types/productDetail'

export function useProductDetailData(slug: string) {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.products.getBySlug(slug).then((raw: any) => {
      const detail = adaptProductDetail(raw)
      const summary = raw.reviewSummary
      const related = raw.relatedProducts

      const withReviews: ProductData = {
        ...detail,
        reviews: summary
          ? {
              average: Number(summary.averageRating ?? 0),
              count: Number(summary.totalReviews ?? 0),
              breakdown: ([5, 4, 3, 2, 1] as const).map((stars) => {
                const dist = summary.ratingDistribution ?? {}
                const ratingCount = Number(dist[stars] ?? 0)
                const total = Number(summary.totalReviews ?? 0)
                return { stars, percentage: total > 0 ? Math.round((ratingCount / total) * 100) : 0 }
              }),
            }
          : detail.reviews,
        relatedProducts: related && Array.isArray(related)
          ? related.slice(0, 4).map(adaptRelatedProduct)
          : detail.relatedProducts,
      }
      setProduct(withReviews)
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Product not found')
    }).finally(() => setLoading(false))
  }, [slug])

  return { product, loading, error }
}
