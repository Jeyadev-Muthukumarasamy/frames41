import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptCart } from '@/lib/adapters'
import type { CartData, CartCharges } from '@/types/shipping'

interface CartCalculation {
  subtotal: number
  couponDiscount: number
  shippingCharge: number
  total: number
}

interface UseCartDataOptions {
  skipFetch?: boolean
}

export function useCartData(options?: UseCartDataOptions) {
  const skipFetch = options?.skipFetch ?? false
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(!skipFetch)
  const [calculation, setCalculation] = useState<CartCalculation | null>(null)

  const fetchCart = useCallback(async () => {
    try {
      const cart = await api.cart.getCart()
      setCartData(adaptCart(cart))
    } catch {
      setCartData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!skipFetch) fetchCart()
  }, [fetchCart, skipFetch])

  const applyPromo = useCallback(async (couponCode: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.cart.calculate({ couponCode }) as any
      setCalculation({
        subtotal: Number(res.subtotal ?? 0),
        couponDiscount: Number(res.couponDiscount ?? 0),
        shippingCharge: Number(res.shippingCharge ?? 0),
        total: Number(res.total ?? 0),
      })
      // Rebuild charges with promo applied
      if (cartData) {
        const charges: CartCharges = {
          shippingInr: Number(res.shippingCharge ?? 0),
          taxInr: 0,
          discountInr: Number(res.couponDiscount ?? 0),
        }
        setCartData({ ...cartData, charges })
      }
    } catch {
      // invalid promo — ignore
    }
  }, [cartData])

  return { cartData, loading, calculation, fetchCart, applyPromo }
}
