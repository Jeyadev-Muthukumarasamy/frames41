import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptOrderDetails } from '@/lib/adapters'
import type { OrderDetails } from '@/types/order'

interface OrderListItem {
  id: string
  orderNumber: string
  status: string
  total: number
  placedAt: string
  itemCount: number
}

export function useOrderList() {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const fetchOrders = useCallback(async (nextCursor?: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.orders.list({ limit: 10, cursor: nextCursor }) as any
      const items = (res?.orders ?? res?.data ?? res ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (o: any): OrderListItem => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total),
          placedAt: o.placedAt,
          itemCount: o.items?.length ?? 0,
        }),
      )
      if (nextCursor) setOrders((prev) => [...prev, ...items])
      else setOrders(items)
      setCursor(res?.nextCursor ?? null)
      setHasMore(res?.hasMore ?? false)
    } catch {
      // keep state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const loadMore = useCallback(() => {
    if (cursor) fetchOrders(cursor)
  }, [cursor, fetchOrders])

  return { orders, loading, hasMore, loadMore }
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    api.orders.getById(orderId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((raw: any) => setOrder(adaptOrderDetails(raw)))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false))
  }, [orderId])

  return { order, loading, error }
}
