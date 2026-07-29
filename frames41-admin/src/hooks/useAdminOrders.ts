import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminOrderListItem, AdminOrderDetail, OrderStatus, PaginatedMeta } from '@/types/admin'

interface OrdersState {
  orders: AdminOrderListItem[]
  meta: PaginatedMeta | null
  loading: boolean
  error: string | null
}

interface OrderFilters {
  page: number
  limit: number
  status?: OrderStatus
  search?: string
  startDate?: string
  endDate?: string
}

export function useAdminOrders(filters: OrderFilters) {
  const [state, setState] = useState<OrdersState>({
    orders: [],
    meta: null,
    loading: true,
    error: null,
  })

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.admin.getOrders(filters)
      setState({ orders: res.data, meta: res.meta, loading: false, error: null })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load orders',
      }))
    }
  }, [filters.page, filters.limit, filters.status, filters.search, filters.startDate, filters.endDate]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  return { ...state, refresh: fetch }
}

export function useAdminOrderDetail(id: string) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getOrderById(id)
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  const updateStatus = useCallback(
    async (status: OrderStatus, note?: string) => {
      await api.admin.updateOrderStatus(id, status, note)
      await fetch()
    },
    [id, fetch],
  )

  const addTracking = useCallback(
    async (awbCode: string, trackingUrl?: string) => {
      await api.admin.addTracking(id, awbCode, trackingUrl)
      await fetch()
    },
    [id, fetch],
  )

  return { order, loading, error, refresh: fetch, updateStatus, addTracking }
}
