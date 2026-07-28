import type { FormEvent } from 'react'
import type { PaymentStatus } from '../../types/payment'
import Icon from '../ui/Icon'

interface CashOnDeliveryFormProps {
  formId: string
  status: PaymentStatus
  onSubmit: () => Promise<void>
}

export default function CashOnDeliveryForm({ formId, status, onSubmit }: CashOnDeliveryFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status !== 'processing' && status !== 'verifying') void onSubmit()
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <div className="flex items-start gap-md rounded-md bg-surface-container p-md">
        <Icon name="local_shipping" className="text-primary text-[24px]" />
        <div>
          <p className="font-label-bold text-on-surface">Pay when your order is delivered</p>
          <p className="mt-1 font-body-sm text-on-surface-variant">
            Please keep the exact amount ready. Our delivery partner will collect the payment.
          </p>
        </div>
      </div>
    </form>
  )
}
