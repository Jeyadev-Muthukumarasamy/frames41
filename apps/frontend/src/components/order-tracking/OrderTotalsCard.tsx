import type { TrackingTotals } from '../../types/ordertracking'
import { formatINR } from '../../utils/format'

interface OrderTotalsCardProps {
  totals: TrackingTotals
  onSupportInquiry?: () => void
  onDownloadInvoice?: () => void
}

export default function OrderTotalsCard({
  totals,
  onSupportInquiry,
  onDownloadInvoice,
}: OrderTotalsCardProps) {
  const { subtotalInr, shippingInr, taxInr, totalInr } = totals

  return (
    <section aria-label="Order total" className="bg-white border border-[#E2E2DE] p-8 rounded-2xl">
      <h3 className="font-headline-md mb-6 text-[#111110]">Order Total</h3>

      <dl className="space-y-4">
        <div className="flex justify-between text-body-md">
          <dt className="text-secondary">Subtotal</dt>
          <dd className="text-[#111110] font-medium">{formatINR(subtotalInr)}</dd>
        </div>
        <div className="flex justify-between text-body-md">
          <dt className="text-secondary">Shipping</dt>
          <dd className="text-[#111110] font-medium">{formatINR(shippingInr)}</dd>
        </div>
        <div className="flex justify-between text-body-md">
          <dt className="text-secondary">Tax</dt>
          <dd className="text-[#111110] font-medium">{formatINR(taxInr)}</dd>
        </div>

        <div className="h-[1px] bg-[#EEEEEC] my-4" role="separator" />

        <div className="flex justify-between items-end">
          <dt className="font-headline-md text-2xl text-[#111110]">Total</dt>
          <dd className="font-headline-md text-3xl text-[#111110]">{formatINR(totalInr)}</dd>
        </div>
      </dl>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onSupportInquiry}
          className="w-full bg-[#800020] text-white py-4 font-label-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Support &amp; Inquiry
        </button>
        <button
          type="button"
          onClick={onDownloadInvoice}
          className="w-full bg-white border border-[#111110] text-[#111110] py-4 font-label-bold uppercase tracking-widest hover:bg-[#111110] hover:text-white transition-all duration-300"
        >
          Download Invoice
        </button>
      </div>
    </section>
  )
}
