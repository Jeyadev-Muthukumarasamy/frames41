import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminCustomerListItem, AdminCustomerDetail, PaginatedMeta } from '@/types/admin'

export function useAdminCustomers(params: { page: number; limit: number; search?: string }) {
  const [customers, setCustomers] = useState<AdminCustomerListItem[]>([])
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.admin.getCustomers(params)
      setCustomers(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [params.page, params.limit, params.search]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])
  return { customers, meta, loading, error, refresh: fetch }
}

export function useAdminCustomerDetail(id: string) {
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.admin.getCustomerById(id)
      .then(setCustomer)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [id])

  return { customer, loading, error }
}
