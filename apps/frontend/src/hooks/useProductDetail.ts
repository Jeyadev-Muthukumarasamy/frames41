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
    api.products.getBySlug(slug).then(async (raw: any) => {
      const detail = adaptProductDetail(raw)

      // Fetch review summary
      const [summary, related] = await Promise.all([
        api.reviews.getSummary(raw.id).catch(() => null),
        api.products.getProducts({ categoryId: raw.categoryId, limit: 4 }).catch(() => null),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any[]

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
        relatedProducts: related
          ? (related?.products ?? related?.data ?? related ?? []).slice(0, 4).map(adaptRelatedProduct)
          : [],
      }
      setProduct(withReviews)
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Product not found')
    }).finally(() => setLoading(false))
  }, [slug])

  return { product, loading, error }
}
