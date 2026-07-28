import type { ChangeEvent, FormEvent } from 'react'

const MAX_PROMO_LENGTH = 32
const ALLOWED_PROMO_PATTERN = /[^A-Z0-9\-]/g

interface PromoCodeFormProps {
  value: string
  onChange: (value: string) => void
  onApply: () => void
}

export default function PromoCodeForm({ value, onChange, onApply }: PromoCodeFormProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const sanitized = e.target.value
      .toUpperCase()
      .replace(ALLOWED_PROMO_PATTERN, '')
      .slice(0, MAX_PROMO_LENGTH)
    onChange(sanitized)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (value.trim().length > 0) onApply()
  }

  const canApply = value.trim().length > 0

  return (
    <div className="mb-lg">
      <label
        htmlFor="promo-code"
        className="block text-[10px] uppercase tracking-widest font-bold mb-xs text-white/40"
      >
        Promo or Referral Code
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
        <input
          id="promo-code"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter Code"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={MAX_PROMO_LENGTH}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!canApply}
          className="bg-white text-[#111110] px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          Apply
        </button>
      </form>
    </div>
  )
}
