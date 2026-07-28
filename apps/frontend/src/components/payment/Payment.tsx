import { useState } from 'react'
import type { PaymentMethodId, PaymentOrderSummary, PaymentPayload, PaymentStatus } from '../../types/payment'
import { ACTIVE_FORM_ID, TRUST_BADGES } from '../../constants/payment'
import { NAV_LINKS } from '../../constants/home'
import Navbar from '../layout/Navbar'
import Footer from '../layout/Footer'
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '../../constants/home'
import PaymentMethodSelector from './PaymentMethodSelector'
import OrderSummaryPanel from './OrderSummaryPanel'

const DEFAULT_METHOD: PaymentMethodId = 'razorpay'

interface PaymentProps {
  summary: PaymentOrderSummary
  onPaymentSubmit?: (method: PaymentMethodId) => Promise<void>
  externalStatus?: PaymentStatus
}

export default function Payment({ summary, onPaymentSubmit, externalStatus }: PaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>(DEFAULT_METHOD)
  const [internalStatus, setInternalStatus] = useState<PaymentStatus>('idle')
  const status = externalStatus ?? internalStatus

  const handleSubmit = async (payload: PaymentPayload) => {
    if (onPaymentSubmit) {
      await onPaymentSubmit(payload.method)
      return
    }
    setInternalStatus('processing')
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))
      setInternalStatus('success')
    } catch {
      setInternalStatus('error')
    }
  }

  const handleMethodChange = (id: PaymentMethodId) => {
    if (status !== 'processing' && status !== 'verifying') {
      setSelectedMethod(id)
      if (!externalStatus) setInternalStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex flex-col">
      <Navbar links={NAV_LINKS} />

      <main className="flex-1 pt-28 sm:pt-32 pb-section max-w-container-max mx-auto w-full px-4 sm:px-6">
        <header className="mb-6 sm:mb-12">
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg mb-2 sm:mb-4">Payment Method</h1>
          <p className="font-body-md text-on-surface-variant max-w-md text-sm sm:text-body-md">
            Secure checkout powered by Frames41. Select your preferred method of payment to
            complete your order.
          </p>
        </header>

        {status === 'success' && (
          <div
            role="status"
            aria-live="polite"
            className="mb-8 p-md border border-primary bg-primary/5 font-label-bold text-primary rounded-lg"
          >
            Payment successful! Redirecting to your order confirmation…
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="mb-8 p-md border border-error bg-error/5 font-label-bold text-error rounded-lg"
          >
            Payment failed. Please try again or choose a different method.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          <section className="lg:col-span-7" aria-label="Payment method selection">
            <PaymentMethodSelector
              formId={ACTIVE_FORM_ID}
              selectedMethod={selectedMethod}
              onMethodChange={handleMethodChange}
              onSubmit={handleSubmit}
              status={status}
            />
          </section>

          <aside className="lg:col-span-5" aria-label="Order summary">
            <OrderSummaryPanel
              formId={ACTIVE_FORM_ID}
              summary={summary}
              trustBadges={TRUST_BADGES}
              status={status}
              paymentMethod={selectedMethod}
            />
          </aside>
        </div>
      </main>

      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </div>
  )
}
