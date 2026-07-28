import { useState } from 'react'

export interface AddressFormData {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

interface AddressFormInlineProps {
  onSave: (data: AddressFormData) => Promise<unknown>
  onCancel: () => void
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep',
  'Puducherry',
]

export default function AddressFormInline({ onSave, onCancel }: AddressFormInlineProps) {
  const [form, setForm] = useState<AddressFormData>({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  function update<K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
    if (submitError) setSubmitError(null)
  }

  function validate(): boolean {
    const e: Partial<Record<keyof AddressFormData, string>> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit number'
    if (!form.line1.trim()) e.line1 = 'Street address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.pincode.trim()) e.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSubmitError(null)
    try {
      await onSave(form)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save address. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-primary rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-xl text-on-background">Add New Address</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-secondary hover:text-on-background transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.fullName && <p className="text-xs text-error mt-1">{errors.fullName}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Phone Number
          </label>
          <div className="flex items-center border border-outline-variant rounded overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
            <span className="px-3 py-3 text-sm text-secondary bg-surface border-r border-outline-variant">+91</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="flex-1 px-3 py-3 text-sm outline-none"
            />
          </div>
          {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Pincode
          </label>
          <input
            type="text"
            value={form.pincode}
            onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="600001"
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.pincode && <p className="text-xs text-error mt-1">{errors.pincode}</p>}
        </div>

        {/* Street Address */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Street Address / House No.
          </label>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => update('line1', e.target.value)}
            placeholder="e.g. 42, Park Street, Apt 3B"
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.line1 && <p className="text-xs text-error mt-1">{errors.line1}</p>}
        </div>

        {/* Landmark */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Landmark <span className="font-normal normal-case text-secondary/60">(optional)</span>
          </label>
          <input
            type="text"
            value={form.line2}
            onChange={(e) => update('line2', e.target.value)}
            placeholder="e.g. Near City Mall, Opposite HDFC Bank"
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            City
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Chennai"
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.city && <p className="text-xs text-error mt-1">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            State
          </label>
          <select
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-error mt-1">{errors.state}</p>}
        </div>

        {/* Default checkbox */}
        <div className="md:col-span-2 flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={form.isDefault}
            onChange={(e) => update('isDefault', e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          <label htmlFor="isDefault" className="text-sm text-on-background cursor-pointer">
            Make this my default address
          </label>
        </div>
      </div>

      {submitError && (
        <p className="text-xs text-error mt-4 bg-red-50 p-3 rounded">{submitError}</p>
      )}

      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary text-white py-3 rounded font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 border border-outline-variant rounded text-sm font-bold uppercase tracking-widest hover:bg-surface transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}