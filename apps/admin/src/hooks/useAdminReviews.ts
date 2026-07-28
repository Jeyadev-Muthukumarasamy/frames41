import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminPendingReview, PaginatedMeta } from '@/types/admin'

export function useAdminReviews(params: { page: number; limit: number }) {
  const [reviews, setReviews] = useState<AdminPendingReview[]>([])
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.admin.getPendingReviews(params)
      setReviews(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [params.page, params.limit]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  const approveReview = useCallback(async (id: string) => {
    await api.admin.approveReview(id)
    await fetch()
  }, [fetch])

  const rejectReview = useCallback(async (id: string) => {
    await api.admin.rejectReview(id)
    await fetch()
  }, [fetch])

  return { reviews, meta, loading, error, approveReview, rejectReview, refresh: fetch }
}
