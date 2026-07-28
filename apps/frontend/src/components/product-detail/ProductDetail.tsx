import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { ProductData } from '../../types/productDetail'
import { useProductDetail } from '@/hooks/useProductDetailUi'
import ProductActions from './ProductActions'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import ProductTabs from './ProductTabs'
import RelatedProducts from './RelatedProducts'
import ReviewSummary from './ReviewSummary'
import CustomerCustomizationForm from './CustomerCustomizationForm'

export interface AddToCartPayload {
  readonly productId: string
  readonly quantity: number
  readonly customization?: Record<string, unknown>
  readonly customImageUrl?: string
}


function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
interface ProductDetailProps {
  readonly data: ProductData
  onAddToCart?: (payload: AddToCartPayload) => Promise<unknown>
  onWishlistToggle?: (productId: string, wishlisted: boolean) => void
  onRelatedProductClick?: (productId: string) => void
  onViewAllRelated?: () => void
  onWriteReview?: () => void
}

export default function ProductDetail({
  data,
  onAddToCart,
  onWishlistToggle,
  onRelatedProductClick,
  onViewAllRelated,
  onWriteReview,
}: ProductDetailProps) {
  const {
    quantity,
    activeTab,
    isWishlisted,
    increment,
    decrement,
    setActiveTab,
    toggleWishlist,
  } = useProductDetail(data.id)

  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'added'>('idle')
  const [images, setImages] = useState<File[]>([])
  const [names, setNames] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [songName, setSongName] = useState('')
  const [qrCodeImages, setQrCodeImages] = useState<File[]>([])
  const [customizationError, setCustomizationError] = useState('')
  const config = data.customizationConfig
  const { isAuthenticated } = useAuth()

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart || cartStatus !== 'idle') return
    if (config.numberOfImages.enabled && images.length !== config.numberOfImages.count) {
      setCustomizationError(`Please upload exactly ${config.numberOfImages.count} image(s).`)
      return
    }
    if (config.numberOfNames.enabled && (
      names.length !== config.numberOfNames.count ||
      names.some((name) => !name.trim())
    )) {
      setCustomizationError(`Please enter all ${config.numberOfNames.count} name(s).`)
      return
    }
    if (config.date.enabled && !date) {
      setCustomizationError('Please select a date.')
      return
    }
    if (config.songName.enabled && !songName.trim()) {
      setCustomizationError('Please enter the song name.')
      return
    }
    if (config.qrCodeImages.enabled && qrCodeImages.length !== config.qrCodeImages.count) {
      setCustomizationError(`Please upload exactly ${config.qrCodeImages.count} QR code image(s).`)
      return
    }
    const oversizedFile = [...images, ...qrCodeImages].find((file) => file.size > 200 * 1024 * 1024)
    if (oversizedFile) {
      setCustomizationError(`${oversizedFile.name} must be 200 MB or smaller.`)
      return
    }
    setCartStatus('adding')
    setCustomizationError('')
    try {
      const customization: Record<string, unknown> = {}
      let customImageUrl: string | undefined

      if (isAuthenticated) {
        const { api } = await import('../../lib/api')
        const imageUrls = await Promise.all(
          images.map(async (file) => (await api.cart.uploadPhoto(file)).url),
        )
        const qrCodeImageUrls = await Promise.all(
          qrCodeImages.map(async (file) => (await api.cart.uploadPhoto(file)).url),
        )
        if (imageUrls.length) customization.imageUrls = imageUrls
        if (qrCodeImageUrls.length) customization.qrCodeImageUrls = qrCodeImageUrls
        customImageUrl = imageUrls[0]
      } else {
        const imageDataUrls = await Promise.all(images.map(fileToDataUrl))
        const qrCodeImageDataUrls = await Promise.all(qrCodeImages.map(fileToDataUrl))
        if (imageDataUrls.length) customization.imageDataUrls = imageDataUrls
        if (qrCodeImageDataUrls.length) customization.qrCodeImageDataUrls = qrCodeImageDataUrls
        customImageUrl = imageDataUrls[0]
      }

      if (config.numberOfNames.enabled) customization.names = names.map((name) => name.trim())
      if (config.date.enabled) customization.date = date
      if (config.songName.enabled) customization.songName = songName.trim()

      await onAddToCart({
        productId: data.id,
        quantity,
        customImageUrl,
        customization: Object.keys(customization).length ? customization : undefined,
      })
      setCartStatus('added')
      setTimeout(() => setCartStatus('idle'), 2000)
    } catch {
      setCustomizationError('We could not save your customization. Please try again.')
      setCartStatus('idle')
    }
  }, [onAddToCart, data.id, quantity, cartStatus, config, images, names, date, songName, qrCodeImages, isAuthenticated])

  const handleWishlistToggle = useCallback(() => {
    const next = !isWishlisted
    toggleWishlist()
    onWishlistToggle?.(data.id, next)
  }, [isWishlisted, toggleWishlist, onWishlistToggle, data.id])

  return (
    <main id="main-content" className="max-w-container mx-auto px-4 pb-16 pt-6 sm:px-6 sm:pb-xl sm:pt-8">
      {/* Gallery + product info */}
      <div className="grid grid-cols-1 items-start gap-8 rounded-2xl border border-outline-variant/40 bg-background p-4 shadow-sm sm:gap-xl sm:p-6 lg:grid-cols-12 lg:p-8">
        <ProductGallery images={data.images} />

        <section aria-label="Product information" className="lg:col-span-5 flex flex-col gap-8">
          <ProductInfo
            name={data.name}
            priceInr={data.priceInr}
            inStock={data.inStock}
            reviewAverage={data.reviews.average}
            reviewCount={data.reviews.count}
            description={data.description}
            features={data.features}
          />
          <ProductActions
            customizationContent={(
              <CustomerCustomizationForm
                config={config}
                images={images}
                names={names}
                date={date}
                songName={songName}
                qrCodeImages={qrCodeImages}
                error={customizationError}
                onImagesChange={(files) => { setImages(files); setCustomizationError('') }}
                onNamesChange={(values) => { setNames(values); setCustomizationError('') }}
                onDateChange={(value) => { setDate(value); setCustomizationError('') }}
                onSongNameChange={(value) => { setSongName(value); setCustomizationError('') }}
                onQrCodeImagesChange={(files) => { setQrCodeImages(files); setCustomizationError('') }}
              />
            )}
            quantity={quantity}
            isWishlisted={isWishlisted}
            shippingNote={data.shippingNote}
            shippingDuration={data.shippingDuration}
            cartStatus={cartStatus}
            onIncrement={increment}
            onDecrement={decrement}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        </section>
      </div>

      {/* Tabs + review summary */}
      <section
        aria-labelledby="details-heading"
        className="mt-12 sm:mt-xl grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-xl border-t border-outline-variant pt-12 sm:pt-xl"
      >
        <h2 id="details-heading" className="sr-only">
          Product details and reviews
        </h2>
        <div className="lg:col-span-8">
          <ProductTabs tabs={data.tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="lg:col-span-4">
          <ReviewSummary reviews={data.reviews} onWriteReview={onWriteReview} />
        </div>
      </section>

      <RelatedProducts
        products={data.relatedProducts}
        onProductClick={onRelatedProductClick}
        onViewAll={onViewAllRelated}
      />
    </main>
  )
}
