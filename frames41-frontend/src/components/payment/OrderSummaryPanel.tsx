import type { PaymentMethodId, PaymentOrderSummary, PaymentStatus, TrustBadge } from '../../types/payment'
import Icon from '../ui/Icon'

interface OrderSummaryPanelProps {
  formId: string
  summary: PaymentOrderSummary
  trustBadges: ReadonlyArray<TrustBadge>
  status: PaymentStatus
  paymentMethod: PaymentMethodId
}

export default function OrderSummaryPanel({
  formId,
  summary,
  trustBadges,
  status,
  paymentMethod,
}: OrderSummaryPanelProps) {
  const isProcessing = status === 'verifying' || status === 'processing'
  const { product, lineItems, totalLabel, totalValue } = summary
  const actionLabel = paymentMethod === 'cod'
    ? 'Place Order'
    : paymentMethod === 'razorpay'
      ? 'Pay with Razorpay'
      : 'Pay Now'

  return (
    <div className="bg-surface-container p-4 sm:p-xl rounded-lg sm:sticky sm:top-32">
      <h2 className="font-headline-md text-xl sm:text-headline-md mb-4 sm:mb-8">Order Summary</h2>

      <div className="flex gap-3 sm:gap-md mb-4 sm:mb-8">
        <div className="w-16 h-20 sm:w-24 sm:h-32 flex-shrink-0 bg-surface-container-highest overflow-hidden rounded-sm">
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex flex-col justify-center gap-1 sm:gap-xs min-w-0">
          <p className="font-label-sm text-on-surface-variant text-xs sm:text-label-sm">{product.collection}</p>
          <h4 className="text-base sm:font-body-lg leading-tight">{product.name}</h4>
          <p className="font-label-bold text-on-surface text-sm sm:text-base">Qty: {product.qty}</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 border-t border-outline-variant pt-4 sm:pt-lg mb-4 sm:mb-8">
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="font-body-md text-on-surface-variant text-sm sm:text-body-md">{item.label}</span>
            <span className={`font-label-bold text-sm sm:text-base ${item.isFree ? 'text-primary' : ''}`}>
              {item.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-on-surface pt-3 sm:pt-4">
          <span className="font-label-bold text-sm sm:text-body-lg uppercase tracking-wider">{totalLabel}</span>
          <span className="font-headline-md text-lg sm:text-headline-md">{totalValue}</span>
        </div>
      </div>

      {/* Links to the active payment form so this button submits it */}
      <button
        type="submit"
        form={formId}
        disabled={isProcessing}
        aria-label={isProcessing ? 'Processing payment' : actionLabel}
        className="w-full bg-primary text-white font-label-bold py-3 sm:py-lg text-sm sm:text-body-md uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing…' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
        <Icon name={paymentMethod === 'cod' ? 'local_shipping' : 'lock'} className="text-base sm:text-[20px]" />
      </button>

      <div className="mt-4 sm:mt-8 flex items-center justify-center gap-2 sm:gap-md text-on-surface-variant opacity-60">
        <Icon name="verified_user" className="text-sm sm:text-[18px]" />
        <span className="font-label-sm uppercase tracking-widest text-xs sm:text-label-sm">100% Secure Transaction</span>
      </div>

      <div
        className="mt-4 sm:mt-8 pt-4 sm:pt-8 border-t border-outline-variant flex justify-center items-center gap-4 sm:gap-6 grayscale opacity-40"
        aria-label="Accepted payment providers"
      >
        {trustBadges.map((badge) => (
          <img
            key={badge.alt}
            src={badge.src}
            alt={badge.alt}
            className={badge.className}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}
