import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { AdminCoupon, CouponFormData } from '@/types/admin'

export function useAdminCoupons() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCoupons(await api.admin.getCoupons())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const createCoupon = useCallback(async (data: CouponFormData) => {
    await api.admin.createCoupon(data)
    await refresh()
  }, [refresh])

  const updateCoupon = useCallback(async (id: string, data: Partial<CouponFormData>) => {
    await api.admin.updateCoupon(id, data)
    await refresh()
  }, [refresh])

  const archiveCoupon = useCallback(async (id: string) => {
    await api.admin.archiveCoupon(id)
    await refresh()
  }, [refresh])

  return { coupons, loading, error, createCoupon, updateCoupon, archiveCoupon }
}
