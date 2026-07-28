import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import type { HERO } from '../../constants/home'
import type { Banner } from '../../types/home'
import Icon from '../ui/Icon'

type HeroData = typeof HERO

interface HeroSectionProps {
  data: HeroData
  banners?: Banner[]
  onExploreCta?: () => void
}

/* ─── Slide data ─── */
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=1600&q=85',
    alt: 'Handcrafted wooden photo frame on shelf',
    headline: 'Handcrafted Soul\nfor Modern Spaces',
    sub: 'Artisanal wooden frames and DIY kits, carved with precision and finished with love.',
  },
  {
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=85',
    alt: 'Artisan workshop with wood shavings',
    headline: 'Made by Hand,\nMade for You',
    sub: 'Every piece tells a story. Personalised, premium, and built to last a lifetime.',
  },
  {
    img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1600&q=85',
    alt: 'Family photo in a beautiful wooden frame',
    headline: 'Preserve Memories\nin Solid Wood',
    sub: 'Premium teak frames that turn your moments into timeless heirlooms.',
  },
] as const

const AUTO_INTERVAL_MS = 5000

export default function HeroSection({ data, banners = [] }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const slides = useMemo(() => {
    if (!banners.length) return [...SLIDES]

    return banners.map((banner) => ({
      id: banner.id,
      img: banner.imageUrl,
      mobileImg: banner.mobileImageUrl,
      alt: banner.title || data.imageAlt,
      headline: banner.title || data.headline,
      sub: banner.subtitle || data.subheadline,
      link: banner.link,
    }))
  }, [banners, data])

  useEffect(() => {
    setCurrent((index) => Math.min(index, slides.length - 1))
  }, [slides.length])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrent((i) => {
      if (index === i) return i
      return (index + slides.length) % slides.length
    })
  }, [slides.length])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  /* auto-advance with timer reset on manual interaction */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length)
    }, AUTO_INTERVAL_MS)
  }, [slides.length])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    startTimer()
    return () => stopTimer()
  }, [startTimer, stopTimer])

  /* touch / swipe */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const diff = touchStartX.current - e.changedTouches[0].screenX
    const threshold = 50
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrent((i) => (i + 1) % slides.length)
      } else {
        setCurrent((i) => (i - 1 + slides.length) % slides.length)
      }
      startTimer()
    }
    touchStartX.current = null
  }, [slides.length, startTimer])

  const handleManual = useCallback((action: () => void) => {
    stopTimer()
    action()
    startTimer()
  }, [startTimer, stopTimer])

  const handlePrev = useCallback(() => handleManual(prev), [handleManual, prev])
  const handleNext = useCallback(() => handleManual(next), [handleManual, next])
  const handleDot = useCallback((i: number) => handleManual(() => goTo(i)), [handleManual, goTo])

  return (
    <section
      aria-label="Hero banners"
      className="group relative w-full overflow-hidden aspect-[17/6] md:aspect-[16/9] md:min-h-[420px] max-h-[600px]"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={'id' in s ? s.id : i}
          className={`absolute inset-0 ${mounted ? 'transition-opacity duration-700 ease-in-out' : ''} ${
            i === current ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 10 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <picture className="block h-full w-full">
            {'mobileImg' in s && s.mobileImg && (
              <source media="(max-width: 639px)" srcSet={s.mobileImg} />
            )}
            <img
              src={s.img}
              alt={s.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-contain"
            />
          </picture>
          {/* overlay: light on mobile (no text), darker on desktop */}
        </div>
      ))}

      {/* Text content — hidden on mobile */}
      {/* Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 top-1/2 z-30 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:left-6 sm:h-12 sm:w-12"
      >
        <Icon name="chevron_left" className="text-xl" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 top-1/2 z-30 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:right-6 sm:h-12 sm:w-12"
      >
        <Icon name="chevron_right" className="text-xl" />
      </button>

      {/* Dots — mobile (compact, inside banner edge) */}
      <div className="flex sm:hidden absolute bottom-1 left-0 right-0 z-30 items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Dots — tablet/desktop */}
      <div className="hidden sm:flex absolute bottom-2 left-0 right-0 z-30 items-center justify-center gap-2 sm:bottom-5 md:bottom-7">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
