import { useId, useState } from 'react'
import type { CardFormValues, PaymentStatus } from '../../types/payment'

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function isValidExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = parseInt(match[1], 10)
  const year = parseInt(match[2], 10) + 2000
  if (month < 1 || month > 12) return false
  const now = new Date()
  return new Date(year, month - 1) >= new Date(now.getFullYear(), now.getMonth())
}

const INITIAL: CardFormValues = { cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '' }

type FieldErrors = Partial<Record<keyof CardFormValues, string>>

interface CardFormProps {
  formId: string
  onSubmit: (values: CardFormValues) => Promise<void>
  status: PaymentStatus
}

export default function CardForm({ formId, onSubmit, status }: CardFormProps) {
  const [values, setValues] = useState<CardFormValues>(INITIAL)
  const [errors, setErrors] = useState<FieldErrors>({})

  const cardNumberId = useId()
  const expiryId = useId()
  const cvvId = useId()
  const nameId = useId()

  const isSubmitting = status === 'verifying' || status === 'processing'

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    if (values.cardNumber.replace(/\s/g, '').length !== 16)
      errs.cardNumber = 'Enter a valid 16-digit card number'
    if (!isValidExpiry(values.expiryDate))
      errs.expiryDate = 'Enter a valid expiry (MM/YY)'
    if (!/^\d{3,4}$/.test(values.cvv))
      errs.cvv = 'Enter a valid CVV'
    if (values.nameOnCard.trim().length < 2)
      errs.nameOnCard = 'Enter the name as it appears on your card'
    return errs
  }

  const handleChange =
    (field: keyof CardFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value
      if (field === 'cardNumber') val = formatCardNumber(val)
      if (field === 'expiryDate') val = formatExpiry(val)
      if (field === 'cvv') val = val.replace(/\D/g, '').slice(0, 4)
      if (field === 'nameOnCard') val = val.slice(0, 60).toUpperCase()
      setValues((prev) => ({ ...prev, [field]: val }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    await onSubmit(values)
  }

  const inputClass = (field: keyof CardFormValues) =>
    [
      'w-full bg-white border px-md py-sm font-body-md',
      'focus:border-on-surface focus:ring-0 outline-none transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      errors[field] ? 'border-error' : 'border-outline-variant',
    ].join(' ')

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
      <div>
        <label htmlFor={cardNumberId} className="block font-label-sm text-on-surface-variant mb-xs">
          Card Number
        </label>
        <input
          id={cardNumberId}
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={values.cardNumber}
          onChange={handleChange('cardNumber')}
          disabled={isSubmitting}
          aria-invalid={!!errors.cardNumber || undefined}
          className={inputClass('cardNumber')}
        />
        {errors.cardNumber && (
          <p role="alert" className="mt-xs font-label-sm text-error">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div>
          <label htmlFor={expiryId} className="block font-label-sm text-on-surface-variant mb-xs">
            Expiry Date
          </label>
          <input
            id={expiryId}
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={values.expiryDate}
            onChange={handleChange('expiryDate')}
            disabled={isSubmitting}
            aria-invalid={!!errors.expiryDate || undefined}
            className={inputClass('expiryDate')}
          />
          {errors.expiryDate && (
            <p role="alert" className="mt-xs font-label-sm text-error">{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label htmlFor={cvvId} className="block font-label-sm text-on-surface-variant mb-xs">
            CVV
          </label>
          <input
            id={cvvId}
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="•••"
            value={values.cvv}
            onChange={handleChange('cvv')}
            disabled={isSubmitting}
            aria-invalid={!!errors.cvv || undefined}
            className={inputClass('cvv')}
          />
          {errors.cvv && (
            <p role="alert" className="mt-xs font-label-sm text-error">{errors.cvv}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={nameId} className="block font-label-sm text-on-surface-variant mb-xs">
          Name on Card
        </label>
        <input
          id={nameId}
          type="text"
          autoComplete="cc-name"
          placeholder="JOHN DOE"
          value={values.nameOnCard}
          onChange={handleChange('nameOnCard')}
          disabled={isSubmitting}
          aria-invalid={!!errors.nameOnCard || undefined}
          className={inputClass('nameOnCard')}
        />
        {errors.nameOnCard && (
          <p role="alert" className="mt-xs font-label-sm text-error">{errors.nameOnCard}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white font-label-bold py-md uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing…' : 'Pay Securely'}
      </button>
    </form>
  )
}
