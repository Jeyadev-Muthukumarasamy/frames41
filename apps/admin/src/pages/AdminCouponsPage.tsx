import { useMemo, useState } from 'react'
import { useAdminCoupons } from '@/hooks/useAdminCoupons'
import { useToast } from '@/hooks/useToast'
import type { AdminCoupon, CouponFormData, CouponType } from '@/types/admin'

const input = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary'

function localDate(value: string) {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function defaults(coupon?: AdminCoupon): CouponFormData {
  if (coupon) return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderValue: coupon.minOrderValue ?? undefined,
    maxDiscount: coupon.maxDiscount ?? undefined,
    usageLimit: coupon.usageLimit ?? undefined,
    perUserLimit: coupon.perUserLimit ?? undefined,
    validFrom: localDate(coupon.validFrom),
    validTo: localDate(coupon.validTo),
    isActive: coupon.isActive,
  }
  const start = new Date()
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return {
    code: '',
    type: 'PERCENT',
    value: 1,
    validFrom: localDate(start.toISOString()),
    validTo: localDate(end.toISOString()),
    isActive: true,
  }
}

function CouponForm({ coupon, save, close }: {
  coupon?: AdminCoupon
  save: (data: CouponFormData) => Promise<void>
  close: () => void
}) {
  const [form, setForm] = useState(() => defaults(coupon))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof CouponFormData>(key: K, value: CouponFormData[K]) =>
    setForm((current) => ({ ...current, [key]: value }))
  const optionalNumber = (value: string) => value === '' ? undefined : Number(value)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await save({
        ...form,
        code: form.code.trim().toUpperCase(),
        maxDiscount: form.type === 'PERCENT' ? form.maxDiscount : undefined,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo).toISOString(),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save coupon')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">Code<input required minLength={3} maxLength={20} value={form.code}
          onChange={(e) => set('code', e.target.value.toUpperCase())} className={input} /></label>
        <label className="text-sm">Type<select value={form.type}
          onChange={(e) => set('type', e.target.value as CouponType)} className={input}>
          <option value="PERCENT">Percentage</option>
          <option value="FLAT">Flat amount</option>
          <option value="FIRST_ORDER">First order</option>
        </select></label>
        <label className="text-sm">{form.type === 'PERCENT' ? 'Percentage' : 'Amount (₹)'}
          <input required type="number" min="0.01" max={form.type === 'PERCENT' ? 100 : undefined}
            step="0.01" value={form.value} onChange={(e) => set('value', Number(e.target.value))} className={input} /></label>
        <label className="text-sm">Minimum order (₹)<input type="number" min="0" step="0.01"
          value={form.minOrderValue ?? ''} onChange={(e) => set('minOrderValue', optionalNumber(e.target.value))} className={input} /></label>
        <label className="text-sm">Maximum discount (₹)<input type="number" min="0" step="0.01"
          disabled={form.type !== 'PERCENT'} value={form.maxDiscount ?? ''}
          onChange={(e) => set('maxDiscount', optionalNumber(e.target.value))} className={input} /></label>
        <label className="text-sm">Total usage limit<input type="number" min="1" step="1"
          value={form.usageLimit ?? ''} onChange={(e) => set('usageLimit', optionalNumber(e.target.value))} className={input} /></label>
        <label className="text-sm">Limit per customer<input type="number" min="1" step="1"
          value={form.perUserLimit ?? ''} onChange={(e) => set('perUserLimit', optionalNumber(e.target.value))} className={input} /></label>
        <label className="text-sm">Starts<input required type="datetime-local" value={form.validFrom}
          onChange={(e) => set('validFrom', e.target.value)} className={input} /></label>
        <label className="text-sm">Ends<input required type="datetime-local" value={form.validTo}
          onChange={(e) => set('validTo', e.target.value)} className={input} /></label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox"
          checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />Active</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
        <button disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">
          {saving ? 'Saving…' : 'Save coupon'}
        </button>
      </div>
    </form>
  )
}

export default function AdminCouponsPage() {
  const { coupons, loading, error, createCoupon, updateCoupon, archiveCoupon } = useAdminCoupons()
  const { addToast } = useToast()
  const [editing, setEditing] = useState<AdminCoupon | 'new' | null>(null)
  const [search, setSearch] = useState('')
  const visible = useMemo(
    () => coupons.filter((coupon) => coupon.code.includes(search.trim().toUpperCase())),
    [coupons, search],
  )
  const money = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

  async function save(data: CouponFormData) {
    if (editing === 'new') await createCoupon(data)
    else if (editing) await updateCoupon(editing.id, data)
    addToast('Coupon saved', 'success')
    setEditing(null)
  }

  async function deactivate(coupon: AdminCoupon) {
    if (!window.confirm(`Deactivate ${coupon.code}?`)) return
    try {
      await archiveCoupon(coupon.id)
      addToast('Coupon deactivated', 'success')
    } catch (cause) {
      addToast(cause instanceof Error ? cause.message : 'Unable to deactivate coupon', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coupon code"
          className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <button onClick={() => setEditing('new')} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">+ New Coupon</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr>
            <th className="p-4">Code</th><th>Discount</th><th>Usage</th><th>Validity</th><th>Status</th><th className="pr-4 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="p-8 text-center">Loading coupons…</td></tr>
              : visible.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">No coupons configured.</td></tr>
                : visible.map((coupon) => <tr key={coupon.id}>
                  <td className="p-4 font-semibold">{coupon.code}<div className="text-xs font-normal text-gray-500">{coupon.type.replace('_', ' ')}</div></td>
                  <td>{coupon.type === 'PERCENT' ? `${coupon.value}%` : money(coupon.value)}</td>
                  <td>{coupon.redemptionCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                  <td className="text-xs">{new Date(coupon.validFrom).toLocaleDateString()} – {new Date(coupon.validTo).toLocaleDateString()}</td>
                  <td>{coupon.isActive ? <span className="text-green-700">Active</span> : <span className="text-gray-500">Inactive</span>}</td>
                  <td className="pr-4 text-right"><button onClick={() => setEditing(coupon)} className="mr-3 text-primary">Edit</button>
                    {coupon.isActive && <button onClick={() => void deactivate(coupon)} className="text-red-600">Deactivate</button>}</td>
                </tr>)}
          </tbody>
        </table>
      </div>
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
        <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="mb-5 text-lg font-semibold">{editing === 'new' ? 'New coupon' : `Edit ${editing.code}`}</h2>
          <CouponForm coupon={editing === 'new' ? undefined : editing} save={save} close={() => setEditing(null)} />
        </div>
      </div>}
    </div>
  )
}
