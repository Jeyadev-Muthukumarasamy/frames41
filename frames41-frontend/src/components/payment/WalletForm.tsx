import { useId, useState } from 'react'
import type { PaymentStatus } from '../../types/payment'

const WALLETS = [
  { id: 'mobikwik', label: 'MobiKwik' },
  { id: 'freecharge', label: 'Freecharge' },
  { id: 'jiomoney', label: 'JioMoney' },
  { id: 'olamoney', label: 'Ola Money' },
] as const

type WalletId = (typeof WALLETS)[number]['id']

interface WalletFormProps {
  formId: string
  onSubmit: (walletId: string) => Promise<void>
  status: PaymentStatus
}

export default function WalletForm({ formId, onSubmit, status }: WalletFormProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const groupId = useId()

  const isSubmitting = status === 'verifying' || status === 'processing'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedWallet) {
      setError('Please select a wallet to continue')
      return
    }
    await onSubmit(selectedWallet)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
      <fieldset>
        <legend className="font-label-sm text-on-surface-variant mb-sm">Select your wallet</legend>
        <div className="grid grid-cols-2 gap-sm">
          {WALLETS.map((wallet) => {
            const isChecked = selectedWallet === wallet.id
            return (
              <label
                key={wallet.id}
                className={[
                  'flex items-center gap-sm p-sm border cursor-pointer transition-colors select-none',
                  isChecked
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant hover:border-on-surface text-on-surface',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name={`${groupId}-wallet`}
                  value={wallet.id}
                  checked={isChecked}
                  disabled={isSubmitting}
                  onChange={() => {
                    setSelectedWallet(wallet.id)
                    setError(null)
                  }}
                  className="sr-only"
                />
                <span className="font-label-sm">{wallet.label}</span>
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
        disabled={isSubmitting || !selectedWallet}
        className="w-full bg-primary text-white font-label-bold py-md uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Linking…' : 'Link & Pay'}
      </button>
    </form>
  )
}
