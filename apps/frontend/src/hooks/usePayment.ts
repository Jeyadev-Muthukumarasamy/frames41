import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type PaymentStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error'

interface RazorpayOrderResponse {
  razorpayOrderId: string
  amount: number
  amountInPaise: number
  currency: string
  keyId: string
  orderNumber?: string
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function usePayment(orderId: string) {
  const { user } = useAuth()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const startPayment = useCallback(async (): Promise<boolean> => {
    setStatus('loading')
    setError(null)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setStatus('error')
      setError('Payment gateway failed to load. Please refresh and try again.')
      return false
    }

    try {
      const paymentOrder = await api.payments.create(orderId) as RazorpayOrderResponse
      if (!paymentOrder.keyId?.trim()) {
        setStatus('error')
        setError('Payment gateway is not configured. Please contact support.')
        return false
      }

      setStatus('processing')

      return await new Promise((resolve) => {
        const rzp = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amountInPaise,
          currency: paymentOrder.currency ?? 'INR',
          order_id: paymentOrder.razorpayOrderId,
          name: 'Frames41',
          description: paymentOrder.orderNumber ? `Order ${paymentOrder.orderNumber}` : 'Frames41 order',
          prefill: {
            name: user?.name ?? undefined,
            email: user?.email ?? undefined,
            contact: user?.phone ?? undefined,
          },
          theme: { color: '#800020' },
          modal: {
            ondismiss: () => {
              setStatus('idle')
              resolve(false)
            },
          },
          handler: async (response) => {
            try {
              await api.payments.verify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              setStatus('success')
              resolve(true)
            } catch (err: unknown) {
              setStatus('error')
              setError(err instanceof Error ? err.message : 'Payment verification failed')
              resolve(false)
            }
          },
        })
        rzp.open()
      })
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      return false
    }
  }, [orderId, user])

  const placeCashOnDelivery = useCallback(async (): Promise<boolean> => {
    setStatus('processing')
    setError(null)
    try {
      await api.payments.cashOnDelivery(orderId)
      setStatus('success')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place cash on delivery order')
      setStatus('error')
      return false
    }
  }, [orderId])

  return { status, error, startPayment, placeCashOnDelivery }
}

