import { useState } from 'react'
import type { CheckoutLineItem, CheckoutTotals, DeliveryMethod } from '../../types/checkout'
import { formatINR } from '../../utils/format'

interface SummaryLineItemProps {
  item: CheckoutLineItem
}

function SummaryLineItem({ item }: SummaryLineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-20 h-24 bg-surface-container overflow-hidden shrink-0">
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-col justify-between flex-grow min-w-0">
        <div>
          <h4 className="font-headline-md text-[18px] leading-tight truncate">{item.name}</h4>
          <p className="font-label-sm text-label-sm text-secondary uppercase">{item.variant}</p>
        </div>
        <p className="font-label-bold text-label-bold">{formatINR(item.priceInr)}</p>
      </div>
    </div>
  )
}

interface OrderTotalsProps {
  totals: CheckoutTotals
  selectedDelivery: DeliveryMethod | undefined
}

function OrderTotals({ totals, selectedDelivery }: OrderTotalsProps) {
  const shippingDisplay: string =
    selectedDelivery === undefined
      ? 'Calculated at next step'
      : totals.shippingInr === 0
        ? 'Complimentary'
        : formatINR(totals.shippingInr)

  return (
    <dl className="space-y-4 pt-6 border-t border-[#E2E2DE]">
      <div className="flex justify-between font-body-md text-body-md">
        <dt className="text-secondary">Subtotal</dt>
        <dd>{formatINR(totals.subtotalInr)}</dd>
      </div>
      <div className="flex justify-between font-body-md text-body-md">
        <dt className="text-secondary">Shipping</dt>
        <dd className="text-primary">{shippingDisplay}</dd>
      </div>
      <div className="flex justify-between font-body-md text-body-md">
        <dt className="text-secondary">Tax</dt>
        <dd>{formatINR(totals.taxInr)}</dd>
      </div>
      {totals.discountInr > 0 && (
        <div className="flex justify-between font-body-md text-body-md text-green-700">
          <dt>Promo discount</dt>
          <dd>−{formatINR(totals.discountInr)}</dd>
        </div>
      )}
      <div className="flex justify-between font-label-bold text-[20px] pt-4 border-t border-[#E2E2DE]">
        <dt>Total</dt>
        <dd>{formatINR(totals.totalInr)}</dd>
      </div>
    </dl>
  )
}

interface OrderSummarySidebarProps {
  items: ReadonlyArray<CheckoutLineItem>
  totals: CheckoutTotals
  selectedDelivery: DeliveryMethod | undefined
  onProceed: () => void
  canProceed: boolean
  isProceeding?: boolean
  couponCode?: string | null
  applyingCoupon?: boolean
  onApplyCoupon?: (code: string) => Promise<number>
  onRemoveCoupon?: () => Promise<void>
}

export default function OrderSummarySidebar({
  items,
  totals,
  selectedDelivery,
  onProceed,
  canProceed,
  isProceeding = false,
  couponCode,
  applyingCoupon = false,
  onApplyCoupon,
  onRemoveCoupon,
}: OrderSummarySidebarProps) {
  const [code, setCode] = useState(couponCode ?? '')
  const [couponError, setCouponError] = useState<string | null>(null)

  async function handleApplyCoupon() {
    if (!onApplyCoupon) return
    setCouponError(null)
    try {
      await onApplyCoupon(code)
    } catch (error: unknown) {
      setCouponError(error instanceof Error ? error.message : 'Unable to apply promo code')
    }
  }

  async function handleRemoveCoupon() {
    if (!onRemoveCoupon) return
    setCouponError(null)
    try {
      await onRemoveCoupon()
      setCode('')
    } catch (error: unknown) {
      setCouponError(error instanceof Error ? error.message : 'Unable to remove promo code')
    }
  }

  return (
    <aside className="w-full lg:w-[400px] shrink-0" aria-label="Order summary">
      <div className="bg-white border border-[#E2E2DE] p-lg sticky top-28">
        <h2 className="font-label-bold text-label-bold uppercase tracking-[0.15em] mb-8 border-b border-[#E2E2DE] pb-4">
          Order Summary
        </h2>

        <ul className="space-y-6 mb-8" aria-label="Items in order">
          {items.map((item) => (
            <li key={item.id}>
              <SummaryLineItem item={item} />
            </li>
          ))}
        </ul>

        <div className="mb-6 border-t border-[#E2E2DE] pt-6">
          <label htmlFor="promo-code" className="block text-xs font-semibold uppercase tracking-widest mb-2">
            Promo code
          </label>
          {couponCode ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-3">
              <div>
                <p className="text-sm font-semibold text-green-800">{couponCode} applied</p>
                <p className="text-xs text-green-700">You save {formatINR(totals.discountInr)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                disabled={applyingCoupon}
                className="text-xs font-semibold uppercase text-green-800 underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex">
              <input
                id="promo-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleApplyCoupon()
                  }
                }}
                maxLength={20}
                autoComplete="off"
                placeholder="Enter code"
                className="min-w-0 flex-1 border border-[#C9C9C3] px-3 py-3 text-sm uppercase outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applyingCoupon || !code.trim()}
                className="bg-primary px-4 text-xs font-semibold uppercase text-white disabled:opacity-50"
              >
                {applyingCoupon ? 'Applying…' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && (
            <p role="alert" className="mt-2 text-xs text-red-600">{couponError}</p>
          )}
        </div>

        <OrderTotals totals={totals} selectedDelivery={selectedDelivery} />

        <button
          type="button"
          onClick={onProceed}
          disabled={!canProceed || isProceeding}
          className="w-full bg-primary text-white font-label-bold py-5 mt-8 uppercase tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90 enabled:active:scale-[0.98]"
        >
          {isProceeding ? 'Placing Order...' : 'Proceed to Payment'}
        </button>
        {!canProceed && (
          <p className="text-center text-[11px] text-secondary mt-2">
            Please add or select a delivery address to continue.
          </p>
        )}

        <p className="text-center font-label-sm text-[10px] text-secondary mt-6 uppercase tracking-widest">
          Secure SSL Encrypted Checkout
        </p>
      </div>
    </aside>
  )
}
