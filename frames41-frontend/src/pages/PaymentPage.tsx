import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePayment } from '@/hooks/usePayment'
import Payment from '@/components/payment/Payment'
import Icon from '@/components/ui/Icon'
import { api } from '@/lib/api'
import type { PaymentMethodId, PaymentOrderSummary, PaymentStatus } from '@/types/payment'

const STATUS_MAP: Record<string, PaymentStatus> = {
  idle: 'idle',
  loading: 'processing',
  processing: 'verifying',
  success: 'success',
  error: 'error',
}

interface PaymentFailedModalProps {
  reason: string
  onRetry: () => void
  onClose: () => void
}

function PaymentFailedModal({ reason, onRetry, onClose }: PaymentFailedModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-failed-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 text-center shadow-2xl border border-outline-variant">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Icon name="error" className="text-3xl" />
        </div>

        <h3 id="payment-failed-title" className="font-headline text-2xl text-on-background mb-2">
          Payment Failed
        </h3>

        <p className="text-sm text-secondary mb-6 leading-relaxed">
          {reason}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-outline-variant py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-on-background hover:bg-surface transition-colors"
          >
            Change Method
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  const { orderId = '' } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { status, error, startPayment, placeCashOnDelivery } = usePayment(orderId)
  const [summary, setSummary] = useState<PaymentOrderSummary | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showFailedModal, setShowFailedModal] = useState(false)

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
            imageUrl:
              item.customImageUrl ||
              item.customization?.customImageUrl ||
              (Array.isArray(item.customization?.imageUrls) ? item.customization.imageUrls[0] : undefined) ||
              snapshot.image ||
              snapshot.imageUrl ||
              snapshot.images?.[0]?.url ||
              item.product?.images?.[0]?.url ||
              '',
            imageAlt: snapshot.imageAlt ?? snapshot.images?.[0]?.alt ?? snapshot.name ?? 'Order item',
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
    setShowFailedModal(false)
    const success = method === 'cod'
      ? await placeCashOnDelivery()
      : await startPayment()

    if (success) {
      navigate(`/order-confirm/${orderId}`, { replace: true })
    } else {
      setShowFailedModal(true)
    }
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
    <>
      <Payment
        summary={summary}
        onPaymentSubmit={handlePaymentSubmit}
        externalStatus={STATUS_MAP[status] ?? 'idle'}
      />

      {showFailedModal && (
        <PaymentFailedModal
          reason={error ?? 'The payment process was cancelled or could not be completed.'}
          onRetry={() => {
            setShowFailedModal(false)
            handlePaymentSubmit('razorpay')
          }}
          onClose={() => setShowFailedModal(false)}
        />
      )}
    </>
  )
}
