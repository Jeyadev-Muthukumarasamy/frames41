import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminRefundListItem, RefundStatus, PaginatedMeta } from '@/types/admin'

export function useAdminRefunds(params: { page: number; limit: number; status?: RefundStatus }) {
  const [refunds, setRefunds] = useState<AdminRefundListItem[]>([])
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.admin.getRefunds(params)
      setRefunds(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }, [params.page, params.limit, params.status]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  const processRefund = useCallback(
    async (id: string, status: RefundStatus, adminNote?: string) => {
      await api.admin.processRefund(id, status, adminNote)
      await fetch()
    },
    [fetch],
  )

  return { refunds, meta, loading, error, processRefund, refresh: fetch }
}
