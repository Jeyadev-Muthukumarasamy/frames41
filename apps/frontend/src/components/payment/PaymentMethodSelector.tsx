import type { PaymentMethodId, PaymentPayload, PaymentStatus } from '../../types/payment'
import { PAYMENT_METHODS } from '../../constants/payment'
import PaymentMethodOption from './PaymentMethodOption'
import RazorpayForm from './RazorpayForm'
import PartialCodForm from './PartialCodForm'

const formatInr = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

interface PaymentMethodSelectorProps {
  formId: string
  selectedMethod: PaymentMethodId
  onMethodChange: (id: PaymentMethodId) => void
  onSubmit: (payload: PaymentPayload) => Promise<void>
  status: PaymentStatus
  totalAmount: number
}

export default function PaymentMethodSelector({
  formId,
  selectedMethod,
  onMethodChange,
  onSubmit,
  status,
  totalAmount,
}: PaymentMethodSelectorProps) {
  const advanceAmount = Math.round(totalAmount * 0.5 * 100) / 100
  const balanceAmount = Math.round((totalAmount - advanceAmount) * 100) / 100

  const activeForm = (() => {
    switch (selectedMethod) {
      case 'razorpay':
        return (
          <RazorpayForm
            formId={formId}
            status={status}
            onSubmit={() => onSubmit({ method: 'razorpay' })}
          />
        )
      case 'partial_cod':
        return (
          <PartialCodForm
            formId={formId}
            status={status}
            onSubmit={() => onSubmit({ method: 'partial_cod' })}
            advanceLabel={formatInr(advanceAmount)}
            balanceLabel={formatInr(balanceAmount)}
          />
        )
    }
  })()

  return (
    <div role="radiogroup" aria-label="Payment methods" className="space-y-4">
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id
        return (
          <PaymentMethodOption
            key={method.id}
            method={method}
            isSelected={isSelected}
            onSelect={onMethodChange}
          >
            {isSelected ? activeForm : null}
          </PaymentMethodOption>
        )
      })}
    </div>
  )
}
