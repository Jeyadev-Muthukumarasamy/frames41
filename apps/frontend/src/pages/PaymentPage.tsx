import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePayment } from '@/hooks/usePayment'
import Payment from '@/components/payment/Payment'
import { api } from '@/lib/api'
import type { PaymentMethodId, PaymentOrderSummary, PaymentStatus } from '@/types/payment'

const STATUS_MAP: Record<string, PaymentStatus> = {
  idle: 'idle',
  loading: 'processing',
  processing: 'verifying',
  success: 'success',
  error: 'error',
}

export default function PaymentPage() {
  const { orderId = '' } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { status, startPayment, placeCashOnDelivery } = usePayment(orderId)
  const [summary, setSummary] = useState<PaymentOrderSummary | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    api.orders.getById(orderId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((order: any) => {
        if (!active) return
        const item = order.items?.[0]
        const snapshot = item?.productSnapshot ?? {}
        const subtotal = Number(order.subtotal ?? 0)
        const discount = Number(order.discount ?? 0)
        const shipping = Number(order.shippingCharge ?? 0)
        const total = Number(order.total ?? subtotal + shipping)
        const tax = Math.max(0, total - subtotal - shipping + discount)
        const formatInr = (value: number) =>
          new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

        if (!item) throw new Error('This order has no items')

        setSummary({
          product: {
            collection: snapshot.collection ?? snapshot.category?.name ?? 'Frames41',
            name: snapshot.name ?? 'Order item',
            qty: Number(item.quantity ?? 1),
            imageUrl: snapshot.images?.[0]?.url ?? '',
            imageAlt: snapshot.images?.[0]?.alt ?? snapshot.name ?? 'Order item',
          },
          lineItems: [
            { label: 'Subtotal', value: formatInr(subtotal) },
            ...(discount > 0 ? [{
              label: order.couponCode ? `Promo (${order.couponCode})` : 'Promo discount',
              value: `−${formatInr(discount)}`,
            }] : []),
            { label: 'Shipping', value: shipping === 0 ? 'Free' : formatInr(shipping), isFree: shipping === 0 },
            ...(tax > 0 ? [{ label: 'Taxes', value: formatInr(tax) }] : []),
          ],
          totalLabel: 'Total',
          totalValue: formatInr(total),
        })
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Failed to load order')
      })

    return () => { active = false }
  }, [orderId])

  const handlePaymentSubmit = async (method: PaymentMethodId) => {
    const success = method === 'cod'
      ? await placeCashOnDelivery()
      : await startPayment()
    if (success) navigate(`/order-confirm/${orderId}`, { replace: true })
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-sm">{loadError}</p>
        <button onClick={() => navigate('/checkout')} className="text-sm text-[#800020] underline">
          Back to checkout
        </button>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Payment
      summary={summary}
      onPaymentSubmit={handlePaymentSubmit}
      externalStatus={STATUS_MAP[status] ?? 'idle'}
    />
  )
}
