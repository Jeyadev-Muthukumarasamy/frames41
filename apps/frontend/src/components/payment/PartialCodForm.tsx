import type { PaymentStatus } from '../../types/payment'
import Icon from '../ui/Icon'

interface PartialCodFormProps {
  formId: string
  onSubmit: () => Promise<void>
  status: PaymentStatus
  advanceLabel: string
  balanceLabel: string
}

export default function PartialCodForm({
  formId,
  onSubmit,
  status,
  advanceLabel,
  balanceLabel,
}: PartialCodFormProps) {
  const isSubmitting = status === 'verifying' || status === 'processing'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-md">
      <div className="flex items-start gap-md rounded-md border border-outline-variant bg-white p-md">
        <Icon name="lock" className="text-primary text-[22px] mt-0.5" />
        <div>
          <p className="font-label-bold text-on-surface">Split your payment</p>
          <p className="font-label-sm text-on-surface-variant mt-xs">
            Pay {advanceLabel} now via Razorpay to confirm your order. Keep {balanceLabel} in cash
            ready for our delivery partner.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-surface-container p-md">
        <div className="flex items-center justify-between font-label-sm">
          <span className="text-on-surface-variant">Due now (Razorpay)</span>
          <span className="font-label-bold text-on-surface">{advanceLabel}</span>
        </div>
        <div className="flex items-center justify-between font-label-sm">
          <span className="text-on-surface-variant">Due on delivery (cash)</span>
          <span className="font-label-bold text-on-surface">{balanceLabel}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white font-label-bold py-md uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Opening Razorpay...' : `Pay ${advanceLabel} with Razorpay`}
      </button>
    </form>
  )
}
