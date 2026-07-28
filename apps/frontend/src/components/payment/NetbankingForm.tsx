import { useId, useState } from 'react'
import type { PaymentStatus } from '../../types/payment'

const BANKS = [
  { id: 'sbi', label: 'State Bank of India' },
  { id: 'hdfc', label: 'HDFC Bank' },
  { id: 'icici', label: 'ICICI Bank' },
  { id: 'axis', label: 'Axis Bank' },
  { id: 'kotak', label: 'Kotak Mahindra' },
  { id: 'other', label: 'Other Bank' },
] as const

type BankId = (typeof BANKS)[number]['id']

interface NetbankingFormProps {
  formId: string
  onSubmit: (bankId: string) => Promise<void>
  status: PaymentStatus
}

export default function NetbankingForm({ formId, onSubmit, status }: NetbankingFormProps) {
  const [selectedBank, setSelectedBank] = useState<BankId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const groupId = useId()

  const isSubmitting = status === 'verifying' || status === 'processing'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBank) {
      setError('Please select your bank to continue')
      return
    }
    await onSubmit(selectedBank)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
      <fieldset>
        <legend className="font-label-sm text-on-surface-variant mb-sm">Select your bank</legend>
        <div className="grid grid-cols-2 gap-sm">
          {BANKS.map((bank) => {
            const isChecked = selectedBank === bank.id
            return (
              <label
                key={bank.id}
                className={[
                  'flex items-center gap-sm p-sm border cursor-pointer transition-colors select-none',
                  isChecked
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant hover:border-on-surface text-on-surface',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name={`${groupId}-bank`}
                  value={bank.id}
                  checked={isChecked}
                  disabled={isSubmitting}
                  onChange={() => {
                    setSelectedBank(bank.id)
                    setError(null)
                  }}
                  className="sr-only"
                />
                <span className="font-label-sm">{bank.label}</span>
              </label>
            )
          })}
        </div>
        {error && (
          <p role="alert" className="mt-xs font-label-sm text-error">{error}</p>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting || !selectedBank}
        className="w-full bg-primary text-white font-label-bold py-md uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Redirecting…' : 'Continue to Bank'}
      </button>
    </form>
  )
}
