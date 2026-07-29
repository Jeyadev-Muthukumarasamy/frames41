import type { PaymentStatus } from '../../types/payment'
import Icon from '../ui/Icon'

interface RazorpayFormProps {
  formId: string
  onSubmit: () => Promise<void>
  status: PaymentStatus
}

export default function RazorpayForm({ formId, onSubmit, status }: RazorpayFormProps) {
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
          <p className="font-label-bold text-on-surface">Pay securely with Razorpay</p>
          <p className="font-label-sm text-on-surface-variant mt-xs">
            Choose UPI, cards, netbanking or wallets in the Razorpay checkout window.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white font-label-bold py-md uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Opening Razorpay...' : 'Pay with Razorpay'}
      </button>
    </form>
  )
}
