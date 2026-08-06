import type { ShippingCost } from '../../types/order'
import { formatINR } from '../../utils/format'

interface OrderTotalsProps {
  subtotalInr: number
  shippingCostInr: ShippingCost
  totalInr: number
  codDueAmountInr?: number
}

export default function OrderTotals({
  subtotalInr,
  shippingCostInr,
  totalInr,
  codDueAmountInr = 0,
}: OrderTotalsProps) {
  const shippingDisplay =
    shippingCostInr === 'complimentary' ? 'Complimentary' : formatINR(shippingCostInr)

  return (
    <div className="border-t border-outline-variant pt-6">
      <dl className="space-y-3">
        <div className="flex justify-between text-on-surface-variant">
          <dt className="text-body-md">Subtotal</dt>
          <dd className="text-body-md">{formatINR(subtotalInr)}</dd>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <dt className="text-body-md">Shipping</dt>
          <dd className="text-body-md">{shippingDisplay}</dd>
        </div>
        <div className="flex justify-between text-on-background font-bold border-t border-outline-variant pt-3">
          <dt className="text-body-lg">Total</dt>
          <dd className="text-body-lg text-primary">{formatINR(totalInr)}</dd>
        </div>
        {codDueAmountInr > 0 && (
          <div className="flex justify-between text-on-surface-variant border-t border-outline-variant pt-3">
            <dt className="text-body-md">Paid now</dt>
            <dd className="text-body-md">{formatINR(totalInr - codDueAmountInr)}</dd>
          </div>
        )}
        {codDueAmountInr > 0 && (
          <div className="flex justify-between text-on-background font-bold">
            <dt className="text-body-md">Due on delivery (cash)</dt>
            <dd className="text-body-md text-primary">{formatINR(codDueAmountInr)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
