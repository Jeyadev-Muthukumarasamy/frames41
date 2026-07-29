import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { adaptOrderTracking } from '@/lib/adapters'
import type { OrderTrackingData } from '@/types/ordertracking'

export function useOrderTracking(orderNumber: string) {
  const [data, setData] = useState<OrderTrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderNumber) return
    api.orders.getByNumber(orderNumber)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((raw: any) => setData(adaptOrderTracking(raw)))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  return { data, loading, error }
}
