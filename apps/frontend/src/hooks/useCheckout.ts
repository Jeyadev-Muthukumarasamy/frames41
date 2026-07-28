import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { adaptAddress, adaptCheckoutLineItem, adaptCheckoutTotals } from '@/lib/adapters'
import type { CheckoutData } from '@/types/checkout'
import { useCart } from '@/contexts/CartContext'

const DELIVERY_METHODS = [
  { id: 'standard', name: 'Standard Delivery', duration: '5–7 business days', priceInr: null },
] as const

interface CartCalculation {
  subtotal: number
  couponDiscount: number
  couponCode?: string
  shippingCharge: number
  total: number
}

export function useCheckout() {
  const { refresh: refreshCart } = useCart()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const orderPromiseRef = useRef<Promise<string | null> | null>(null)
  const orderKeyRef = useRef(`checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await refreshCart()
      const [addresses, cart, calculation] = await Promise.all([
        api.users.getAddresses(),
        api.cart.getCart(),
        api.cart.calculate({}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any[]
      setCheckoutData({
        addresses: (addresses ?? []).map(adaptAddress),
        deliveryMethods: [...DELIVERY_METHODS],
        lineItems: (cart?.items ?? []).map(adaptCheckoutLineItem),
        totals: adaptCheckoutTotals(calculation ?? cart),
      })
      setCouponCode(null)
    } catch {
      setError('Failed to load checkout data')
    } finally {
      setLoading(false)
    }
  }, [refreshCart])

  useEffect(() => {
    // Initial data synchronization is intentionally owned by this checkout hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const createOrder = useCallback(async (addressId: string, code?: string) => {
    if (orderPromiseRef.current) return orderPromiseRef.current

    const promise = (async () => {
      setOrdering(true)
      setError(null)
      try {
        // Re-read the server cart immediately before order creation. This prevents
        // stale checkout UI from submitting after an earlier order cleared the cart.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cart = await api.cart.getCart() as any
        if (!cart?.items?.length) {
          setCheckoutData((current) => current ? {
            ...current,
            lineItems: [],
            totals: adaptCheckoutTotals(cart ?? {}),
          } : current)
          await refreshCart()
          setError('Your cart is empty. Please add items again before checkout.')
          return null
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const order = await api.orders.create(
          { addressId, couponCode: code },
          orderKeyRef.current,
        ) as any
        await refreshCart()
        return order.id as string
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to place order')
        return null
      } finally {
        setOrdering(false)
        orderPromiseRef.current = null
      }
    })()

    orderPromiseRef.current = promise
    return promise
  }, [refreshCart])

  const applyCoupon = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter a promo code')
    setApplyingCoupon(true)
    try {
      const calculation = await api.cart.calculate({
        couponCode: normalized,
      }) as CartCalculation
      setCheckoutData((current) => current ? {
        ...current,
        totals: adaptCheckoutTotals(calculation),
      } : current)
      setCouponCode(calculation.couponCode ?? normalized)
      return calculation.couponDiscount
    } finally {
      setApplyingCoupon(false)
    }
  }, [refreshCart])

  const removeCoupon = useCallback(async () => {
    setApplyingCoupon(true)
    try {
      const calculation = await api.cart.calculate({}) as CartCalculation
      setCheckoutData((current) => current ? {
        ...current,
        totals: adaptCheckoutTotals(calculation),
      } : current)
      setCouponCode(null)
    } finally {
      setApplyingCoupon(false)
    }
  }, [refreshCart])

  return {
    checkoutData,
    loading,
    ordering,
    applyingCoupon,
    couponCode,
    error,
    createOrder,
    applyCoupon,
    removeCoupon,
    refresh: load,
  }
}
