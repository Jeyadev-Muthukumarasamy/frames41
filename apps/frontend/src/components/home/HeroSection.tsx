import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Banner } from '../../types/home'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'
import { useCart } from '../../contexts/CartContext'

interface HeroSectionProps {
  data?: unknown
  banners?: Banner[]
  products?: Product[]
  onExploreCta?: () => void
}

const AUTO_INTERVAL_MS = 10000 // Auto-advance every 10 seconds

// Helper to expand short model names like WE01 to full descriptive titles
function getFormattedTitle(productName: string, categoryName?: string): string {
  if (!categoryName) return productName
  const cleanCat = categoryName.replace(/^\d+\s*/, '').trim()
  if (productName.length <= 4 && !productName.toLowerCase().includes(cleanCat.toLowerCase())) {
    return `${cleanCat} (${productName})`
  }
  return productName
}

export default function HeroSection({
  products = [],
  banners = [],
  onExploreCta,
}: HeroSectionProps) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addedId, setAddedId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Extract top 5 bestselling real products across ANY category
  const topProducts = useMemo(() => {
    const productList = (products || []) as Array<Product & { categoryName?: string; category?: { name?: string } }>

    if (productList.length > 0) {
      const sorted = [...productList].sort((a, b) => {
        const scoreA = (a.badge === 'Bestseller' ? 2 : 0) + (a.badge === 'Featured' ? 1 : 0)
        const scoreB = (b.badge === 'Bestseller' ? 2 : 0) + (b.badge === 'Featured' ? 1 : 0)
        return scoreB - scoreA
      })

      return sorted.slice(0, 5).map((p) => {
        const catName = p.categoryName || p.category?.name || 'Personalized Gift'
        const title = getFormattedTitle(p.name, catName)
        return {
          id: p.id,
          slug: p.slug,
          title,
          categoryName: catName,
          description: p.description || `High quality handcrafted ${catName}. Fully customizable with your personal photo & text.`,
          priceInr: p.priceInr,
          originalPriceInr: p.originalPriceInr || Math.round(p.priceInr * 1.25),
          imageUrl: p.imageUrl,
          imageAlt: title,
          isProduct: true,
        }
      })
    }

    if (banners && banners.length > 0) {
      return banners.slice(0, 5).map((b, idx) => ({
        id: b.id || `banner-${idx}`,
        slug: '',
        title: b.title || 'Personalized Handcrafted Gift',
        categoryName: 'Top Seller',
        description: b.subtitle || 'Customized wooden engraving, LED lamp & personalized frame',
        priceInr: 499,
        originalPriceInr: 999,
        imageUrl: b.imageUrl,
        imageAlt: b.title || 'Top Product',
        isProduct: false,
      }))
    }

    return []
  }, [products, banners])

  const slides = topProducts

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
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

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    addItem(productId, 1)
    setAddedId(productId)
    setTimeout(() => setAddedId(null), 2000)
  }

  // Shimmer skeleton loading state
  if (slides.length === 0) {
    return (
      <section className="w-full bg-[#2b0813] text-amber-50 pt-24 pb-12 lg:pt-28 lg:pb-16 min-h-[440px] flex items-center justify-center border-b border-rose-500/30">
        <div className="max-w-container mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 animate-pulse">
            <div className="h-6 w-44 bg-rose-950/60 rounded-full" />
            <div className="h-10 w-3/4 bg-rose-950/60 rounded-xl" />
            <div className="h-16 w-full bg-rose-950/60 rounded-xl" />
            <div className="h-10 w-48 bg-rose-950/60 rounded-xl" />
          </div>
          <div className="lg:col-span-6 flex justify-center animate-pulse">
            <div className="w-80 h-80 bg-rose-950/60 rounded-3xl" />
          </div>
        </div>
      </section>
    )
  }

  const currentSlide = slides[currentIndex] || slides[0]
  const discount = currentSlide.originalPriceInr
    ? Math.round((1 - currentSlide.priceInr / currentSlide.originalPriceInr) * 100)
    : 0

  return (
    <section
      aria-label="Top Selling Products Showcase"
      className="relative w-full bg-gradient-to-b from-[#2e0914] via-[#1f060d] to-[#120307] text-amber-50 overflow-hidden pt-24 pb-10 lg:pt-28 lg:pb-12 border-b border-rose-500/30"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      {/* Royal Burgundy & Gold Ambient Glow Effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-700/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Header Tag & Nav Controls */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-950/90 via-[#450e1f] to-rose-950/90 border border-rose-400/60 px-3.5 py-1 text-xs font-black text-amber-300 uppercase tracking-widest shadow-md">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            TOP SELLING PRODUCTS
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-bold text-amber-200/80">
              Product {currentIndex + 1} of {slides.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous product"
                className="h-9 w-9 rounded-full border border-rose-400/60 bg-rose-950/80 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 transition-all shadow-md active:scale-90"
              >
                <Icon name="chevron_left" className="text-lg" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next product"
                className="h-9 w-9 rounded-full border border-rose-400/60 bg-rose-950/80 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400 transition-all shadow-md active:scale-90"
              >
                <Icon name="chevron_right" className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Selling Product Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px] lg:min-h-[440px]">
          {/* Left Column: Product Details */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500 text-neutral-950 px-3 py-0.5 text-xs font-black uppercase tracking-wider shadow-lg">
                  #{currentIndex + 1} TOP SELLER
                </span>
                {discount > 0 && (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                    SAVE {discount}%
                  </span>
                )}
              </div>

              <h1 className="font-headline text-2xl sm:text-4xl lg:text-5xl font-extrabold text-amber-100 tracking-tight leading-tight transition-all duration-300 drop-shadow-md">
                {currentSlide.title}
              </h1>

              {currentSlide.description && (
                <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed line-clamp-2">
                  {currentSlide.description}
                </p>
              )}
            </div>

            {/* Price & Rating */}
            <div className="flex flex-wrap items-baseline gap-3 py-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow">
                {formatINR(currentSlide.priceInr)}
              </span>
              {currentSlide.originalPriceInr && (
                <span className="text-lg text-amber-200/50 line-through font-medium">
                  {formatINR(currentSlide.originalPriceInr)}
                </span>
              )}
              <div className="flex items-center gap-1 ml-auto sm:ml-4 text-amber-300 text-sm font-bold bg-rose-950/80 border border-rose-500/50 px-3.5 py-1 rounded-full shadow-inner">
                <Icon name="star" className="text-base fill-current text-amber-400" />
                <span>4.9</span>
                <span className="text-amber-200/60 text-xs font-normal">(120+ reviews)</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (currentSlide.slug) {
                    navigate(`/shop/${currentSlide.slug}`)
                  } else {
                    onExploreCta?.()
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 px-7 py-3.5 text-sm font-extrabold text-neutral-950 shadow-xl shadow-rose-900/40 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95"
              >
                <span>Customize & Order</span>
                <Icon name="arrow_forward" className="text-lg" />
              </button>

              {currentSlide.isProduct && (
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, currentSlide.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-950/90 border border-rose-500/60 px-6 py-3.5 text-sm font-bold text-amber-100 transition-all hover:bg-rose-900/80 hover:border-amber-400 active:scale-95"
                >
                  <Icon name={addedId === currentSlide.id ? 'check' : 'shopping_bag'} className="text-lg text-amber-400" />
                  <span>{addedId === currentSlide.id ? 'Added to Cart!' : 'Quick Add'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Product Showcase Frame */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div
              onClick={() => {
                if (currentSlide.slug) {
                  navigate(`/shop/${currentSlide.slug}`)
                } else {
                  onExploreCta?.()
                }
              }}
              className="group cursor-pointer relative aspect-square w-full max-w-[360px] sm:max-w-[420px] rounded-3xl overflow-hidden bg-gradient-to-tr from-[#3b0b18] via-[#24060f] to-[#120307] border-2 border-rose-400/60 shadow-[0_0_50px_rgba(128,0,32,0.35)] transition-all duration-500 hover:border-amber-400"
            >
              <OptimizedImage
                src={currentSlide.imageUrl}
                alt={currentSlide.imageAlt}
                widthPreset="full"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#140308]/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-amber-100">
                <span className="font-semibold backdrop-blur-md bg-[#2d0914]/90 px-3 py-1.5 rounded-lg border border-rose-400/30 text-amber-200">
                  {currentSlide.categoryName}
                </span>
                <span className="font-bold text-amber-300 flex items-center gap-1 backdrop-blur-md bg-[#2d0914]/90 px-3 py-1.5 rounded-lg border border-rose-400/30">
                  <Icon name="visibility" className="text-sm" /> Preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to top product ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? 'w-8 bg-gradient-to-r from-amber-400 to-rose-400'
                  : 'w-2 bg-rose-950/80 hover:bg-rose-800/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
