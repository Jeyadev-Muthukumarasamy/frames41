import type { CartCharges } from '../../types/shipping'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'

interface SummaryRowProps {
  label: string
  value: string
  highlight?: boolean
}

function SummaryRow({ label, value, highlight = false }: SummaryRowProps) {
  return (
    <div
      className={`flex justify-between text-sm ${
        highlight ? 'text-primary-container font-bold' : 'text-white/60'
      }`}
    >
      <dt>{label}</dt>
      <dd className={highlight ? '' : 'text-white'}>{value}</dd>
    </div>
  )
}

interface OrderSummaryPanelProps {
  charges: CartCharges
  subtotalInr: number
  onCheckout: () => void
}

export default function OrderSummaryPanel({
  charges,
  subtotalInr,
  onCheckout,
}: OrderSummaryPanelProps) {
  const grandTotal = subtotalInr + charges.shippingInr + charges.taxInr - charges.discountInr

  return (
    <aside className="lg:col-span-4" aria-label="Order summary">
      <div className="bg-[#111110] text-white rounded-xl p-4 sm:p-lg lg:sticky lg:top-28 mb-6">
        <h2 className="font-headline text-h3 mb-lg">Order Summary</h2>

        <dl className="space-y-md border-b border-white/10 pb-lg mb-lg">
          <SummaryRow label="Subtotal" value={formatINR(subtotalInr)} />
          <SummaryRow label="Shipping" value={formatINR(charges.shippingInr)} />
          <SummaryRow label="Craft Tax" value={formatINR(charges.taxInr)} />
          {charges.discountInr > 0 && (
            <SummaryRow
              label="Creator Discount"
              value={`−${formatINR(charges.discountInr)}`}
              highlight
            />
          )}
        </dl>

        <div className="flex justify-between items-end mb-lg">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">
              Payable Amount
            </span>
            <span className="font-headline text-h2 text-white">Total</span>
          </div>
          <span className="font-headline text-h2 text-primary-container">
            {formatINR(grandTotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="w-full bg-primary-container text-white py-5 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-container"
        >
          Proceed to Checkout
          <Icon name="arrow_forward" className="text-sm" />
        </button>

        <p className="mt-6 text-[10px] text-white/30 text-center uppercase tracking-widest">
          Secure Checkout Powered by Frames 41 Pay
        </p>
      </div>

      <div className="mt-3 sm:mt-lg bg-white border border-outline-variant rounded-xl p-4 sm:p-lg">
        <div className="flex items-start gap-4">
          <Icon
            name="local_shipping"
            className="text-primary-container shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-on-background mb-1">
              Eco-Friendly Shipping
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Ships in compostable wood pulp packaging. Estimated delivery: 3–5 business days.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
