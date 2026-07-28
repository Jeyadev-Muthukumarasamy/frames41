import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { DashboardStats, AnalyticsSummary, TopProduct, Period } from '@/types/admin'

interface DashboardData {
  stats: DashboardStats | null
  analytics: AnalyticsSummary | null
  topProducts: TopProduct[]
  loading: boolean
  error: string | null
}

export function useAdminDashboard(period: Period, startDate?: string, endDate?: string) {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    analytics: null,
    topProducts: [],
    loading: true,
    error: null,
  })

  const fetch = useCallback(async () => {
    setData((d) => ({ ...d, loading: true, error: null }))
    try {
      const [stats, analytics, topProducts] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getAnalytics(period, startDate, endDate),
        api.admin.getTopProducts(10, startDate, endDate),
      ])
      setData({ stats, analytics, topProducts, loading: false, error: null })
    } catch (err) {
      setData((d) => ({
        ...d,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
      }))
    }
  }, [period, startDate, endDate])

  useEffect(() => { fetch() }, [fetch])

  return { ...data, refresh: fetch }
}
