import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCheckout } from '@/hooks/useCheckout'
import Checkout from '@/components/checkout/Checkout'
import type { AddressFormData } from '@/components/checkout/AddressFormInline'
import { api } from '@/lib/api'
import { NAV_LINKS } from '@/constants/home'
import Navbar from '@/components/layout/Navbar'

type PhoneErrors = Partial<Record<'phone' | 'form', string>>

function normalizePhoneInput(value: string): string {
  const trimmed = value.trim().replace(/[\s()-]/g, '')
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`
  if (/^91\d{10}$/.test(trimmed)) return `+${trimmed}`
  return trimmed
}

function getAuthError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const message = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
    if (message) return message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

function CheckoutOtpGate() {
  const { loginWithPhone } = useAuth()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<PhoneErrors>({})

  function validatePhone(): PhoneErrors {
    const normalized = normalizePhoneInput(phone)
    if (!normalized) return { phone: 'Please enter your phone number.' }
    if (!/^(?:\+[1-9]\d{7,14}|\d{10})$/.test(normalized)) {
      return { phone: 'Enter a valid phone number.' }
    }
    return {}
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validatePhone()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      const normalized = normalizePhoneInput(phone)
      setPhone(normalized)
      await loginWithPhone(normalized)
      toast.success('Mobile number saved')
    } catch (err) {
      setErrors({ form: getAuthError(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-32 pb-section px-6 md:px-12 max-w-container-max mx-auto">
      <header className="mb-12">
        <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Checkout</h1>
        <p className="font-body-md text-body-md text-secondary">Enter your mobile number to continue.</p>
      </header>

      <div className="max-w-md bg-white border border-[#E8E4DA] rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#800020] font-semibold">Step 1</p>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mt-1">Mobile number</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">We will use this number for your order updates.</p>
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Mobile number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setErrors((current) => ({ ...current, phone: undefined, form: undefined }))
              }}
              placeholder="+918220721216"
              className={`w-full border rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020] ${errors.phone ? 'border-red-500' : 'border-[#E0E0E0]'}`}
              autoFocus
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
          {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#800020] text-white py-3 rounded-lg text-sm font-medium disabled:opacity-60">
            {loading ? 'Continuing...' : 'Continue to address'}
          </button>
        </form>
      </div>
    </main>
  )
}

function AuthenticatedCheckout() {
  const navigate = useNavigate()
  const {
    checkoutData, loading, ordering, applyingCoupon, couponCode, error,
    createOrder, applyCoupon, removeCoupon, refresh,
  } = useCheckout()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
        <p className="text-red-600 text-sm">{error ?? 'Failed to load checkout'}</p>
        <button onClick={() => navigate('/cart')} className="text-sm text-[#800020] underline">
          Back to cart
        </button>
      </div>
    )
  }

  const defaultAddress = checkoutData.addresses[0]?.id ?? ''

  async function handleSaveAddress(data: AddressFormData) {
    await api.users.createAddress({
      line1: data.line1,
      line2: data.line2 || undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: data.isDefault,
    })
    toast.success('Address saved')
    await refresh()
  }

  return (
    <>
      <Checkout
        data={checkoutData}
        defaultAddressId={defaultAddress}
        defaultDeliveryId="standard"
        isProceeding={ordering}
        onProceedToPayment={async ({ addressId }) => {
          const orderId = await createOrder(addressId, couponCode ?? undefined)
          if (orderId) navigate(`/payment/${orderId}`)
        }}
        onEditAddress={() => navigate('/profile')}
        onSaveAddress={handleSaveAddress}
        couponCode={couponCode}
        applyingCoupon={applyingCoupon}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={removeCoupon}
      />
      {ordering && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-8 py-6 text-sm">Placing your order...</div>
        </div>
      )}
      {error && <p className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 text-xs px-4 py-2 rounded-lg">{error}</p>}
    </>
  )
}

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <>
      <Navbar links={NAV_LINKS} />
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isAuthenticated ? (
        <AuthenticatedCheckout />
      ) : (
        <CheckoutOtpGate />
      )}
    </>
  )
}