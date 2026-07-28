import { useState } from 'react'
import { api } from '../../lib/api'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export default function NewsletterStrip() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.slice(0, 254))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_REGEX.test(trimmed)) return

    setStatus('loading')
    try {
      await api.newsletter.subscribe(trimmed)
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-primary py-16 sm:py-xl relative overflow-hidden"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        <span className="text-label-bold text-white/80 text-[10px] tracking-[0.4em] uppercase mb-4 sm:mb-6">
          Join the Community
        </span>
        <h2
          id="newsletter-heading"
          className="font-headline text-[24px] sm:text-headline-lg italic text-white mb-6 sm:mb-10 max-w-2xl"
        >
          Subscribe for early access to sales and exclusive DIY tips.
        </h2>

        {status === 'success' ? (
          <p className="text-white font-semibold text-body-lg" role="status">
            You're in! Check your inbox.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row w-full max-w-lg gap-4"
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Your email address"
              autoComplete="email"
              disabled={status === 'loading'}
              required
              className="bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-full px-8 py-4 flex-grow focus:ring-1 focus:ring-white focus:border-white text-sm outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-4 text-white/80 text-sm" role="alert">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 w-96 h-96 border border-white/10 rounded-full pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -left-20 -bottom-20 w-64 h-64 border border-white/10 rounded-full pointer-events-none"
      />
    </section>
  )
}
