import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'
import { api } from '@/lib/api'

const TIERS = [
  { min: 10, max: 24, discount: '10%', label: 'Starter' },
  { min: 25, max: 49, discount: '18%', label: 'Business' },
  { min: 50, max: 99, discount: '25%', label: 'Corporate' },
  { min: 100, max: null, discount: '35%+', label: 'Enterprise' },
]

const USE_CASES = [
  { title: 'Corporate Gifting', desc: 'Personalised frames with employee names, milestones, or company branding.', icon: '🏢' },
  { title: 'Wedding Favours', desc: 'Custom photo frames for guests — choose sizes, finishes, and packaging.', icon: '💒' },
  { title: 'Retail Wholesale', desc: 'Stock our frames in your store with wholesale pricing and drop-shipping options.', icon: '🏪' },
  { title: 'Events & Conferences', desc: 'Branded keepsake frames for seminars, award ceremonies, and team events.', icon: '🎤' },
]

export default function BulkOrdersPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', quantity: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.bulkOrders.create({
        ...form,
        company: form.company || undefined,
        message: form.message || undefined,
        quantity: Number(form.quantity),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main className="pt-32 pb-24 max-w-container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary block mb-4">
            Volume Pricing
          </span>
          <h1 className="font-headline text-4xl italic mb-6">Bulk Orders</h1>
          <p className="text-on-background/60 text-base leading-relaxed">
            Ordering 10 or more frames? Get significant discounts, priority production, and a dedicated account manager.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {TIERS.map(({ min, max, discount, label }) => (
            <div key={label} className="border border-on-background/10 rounded-xl p-6 text-center hover:border-primary transition-colors">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{label}</p>
              <p className="font-headline text-2xl italic mb-1">
                {max ? `${min}–${max}` : `${min}+`} units
              </p>
              <p className="text-2xl font-bold text-primary">{discount} off</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {USE_CASES.map(({ title, desc, icon }) => (
            <div key={title} className="flex gap-4 p-6 bg-surface-variant rounded-xl">
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-on-background mb-1">{title}</h3>
                <p className="text-sm text-on-background/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline text-2xl italic text-center mb-8">Request a Quote</h2>
          {submitted ? (
            <div className="text-center py-12 border border-on-background/10 rounded-xl">
              <p className="text-2xl mb-3">🎉</p>
              <p className="font-semibold text-on-background mb-2">Request received!</p>
              <p className="text-sm text-on-background/60">Our bulk orders team will contact you within 1 business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {(['name', 'email', 'phone', 'company'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-background/60 mb-1 capitalize">
                      {field === 'phone' ? 'Phone Number' : field}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={form[field]}
                      onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                      required={field !== 'company'}
                      className="w-full border border-on-background/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-background/60 mb-1">
                  Estimated Quantity
                </label>
                <input
                  type="number"
                  min="10"
                  value={form.quantity}
                  onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                  required
                  placeholder="e.g. 50"
                  className="w-full border border-on-background/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-background/60 mb-1">
                  Message (optional)
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about your requirements, customisation needs, or preferred delivery date…"
                  className="w-full border border-on-background/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-on-background text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
              {error && <p role="alert" className="text-sm text-red-600 text-center">{error}</p>}
            </form>
          )}
        </div>
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
