import { useId, useState } from 'react'
import type { PaymentStatus } from '../../types/payment'

// VPA format: handle@provider (e.g. user@okicici, 9876543210@ybl)
const VPA_PATTERN = /^[a-zA-Z0-9._-]{2,50}@[a-zA-Z]{2,20}$/
const MAX_VPA_LENGTH = 51

interface UpiFormProps {
  formId: string
  onSubmit: (vpaId: string) => Promise<void>
  status: PaymentStatus
}

export default function UpiForm({ formId, onSubmit, status }: UpiFormProps) {
  const [vpaId, setVpaId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const inputId = useId()
  const errorId = useId()

  const isSubmitting = status === 'verifying' || status === 'processing'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVpaId(e.target.value.slice(0, MAX_VPA_LENGTH))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = vpaId.trim()

    if (!VPA_PATTERN.test(trimmed)) {
      setError('Enter a valid UPI ID (e.g. name@okicici or 9876543210@ybl)')
      return
    }

    await onSubmit(trimmed)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
      <div>
        <label htmlFor={inputId} className="block font-label-sm text-on-surface-variant mb-xs">
          Enter VPA / UPI ID
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="email"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={MAX_VPA_LENGTH}
          value={vpaId}
          onChange={handleChange}
          placeholder="example@upi"
          disabled={isSubmitting}
          aria-invalid={error !== null || undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            'w-full bg-white border px-md py-sm font-body-md',
            'focus:border-on-surface focus:ring-0 outline-none transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error' : 'border-outline-variant',
          ].join(' ')}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-xs font-label-sm text-error">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !vpaId.trim()}
        className="w-full bg-primary text-white font-label-bold py-md uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Verifying…' : 'Verify & Pay'}
      </button>
    </form>
  )
}
