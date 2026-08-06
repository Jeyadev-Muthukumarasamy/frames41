import { useRef, useState } from 'react'
import type { ProductImage } from '../../types/productDetail'
import { getOptimizedImageUrl } from '@/utils/image'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>
}

const ZOOM_LEVEL = 2.5
const LENS_SIZE_PERCENT = 100 / ZOOM_LEVEL

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const selectedImage = images[selectedIndex]
  const canZoom = !selectedImage?.isVideo
  const zoomImageUrl = selectedImage ? getOptimizedImageUrl(selectedImage.url, { width: 1600, quality: 85 }) : ''

  const showPrevImage = () => setSelectedIndex((i) => (i - 1 + images.length) % images.length)
  const showNextImage = () => setSelectedIndex((i) => (i + 1) % images.length)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageContainerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    })
  }

  const lensLeft = Math.min(100 - LENS_SIZE_PERCENT, Math.max(0, zoomPosition.x - LENS_SIZE_PERCENT / 2))
  const lensTop = Math.min(100 - LENS_SIZE_PERCENT, Math.max(0, zoomPosition.y - LENS_SIZE_PERCENT / 2))

  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <div className="relative">
        <div
          ref={imageContainerRef}
          className="relative aspect-square rounded-2xl overflow-hidden bg-[#faf8f0] border border-[#800020]/20 p-2 flex items-center justify-center shadow-inner lg:cursor-zoom-in"
          onMouseEnter={() => canZoom && setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={canZoom ? handleMouseMove : undefined}
          onClick={() => canZoom && setIsLightboxOpen(true)}
        >
          {selectedImage?.isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-surface-container">
              <Icon name="play_circle" className="text-outline text-4xl sm:text-6xl" />
            </div>
          ) : (
            <OptimizedImage
              src={selectedImage?.url}
              alt={selectedImage?.alt}
              widthPreset="full"
              objectFit="contain"
              className="w-full h-full"
              loading="eager"
            />
          )}

          {canZoom && (
            <button
              type="button"
              aria-label="View full-screen image"
              onClick={(e) => {
                e.stopPropagation()
                setIsLightboxOpen(true)
              }}
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#800020] shadow-sm hover:bg-white lg:hidden"
            >
              <Icon name="zoom_in" className="text-xl" />
            </button>
          )}

          {canZoom && isZooming && (
            <div
              className="hidden lg:block absolute border-2 border-[#800020]/60 bg-[#800020]/10 pointer-events-none"
              style={{
                left: `${lensLeft}%`,
                top: `${lensTop}%`,
                width: `${LENS_SIZE_PERCENT}%`,
                height: `${LENS_SIZE_PERCENT}%`,
              }}
            />
          )}
        </div>

        {canZoom && isZooming && (
          <div
            className="hidden lg:block absolute top-0 z-40 aspect-square w-full overflow-hidden rounded-2xl border border-[#800020]/20 bg-[#faf8f0] shadow-xl"
            style={{
              left: 'calc(100% + 1rem)',
              backgroundImage: `url(${zoomImageUrl})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: `${ZOOM_LEVEL * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <div
        role="tablist"
        aria-label="Product images"
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3"
      >
        {images.map((image, index) => {
          const isActive = selectedIndex === index

          return (
            <button
              key={image.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-label={image.isVideo ? 'Play video' : image.alt}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-xl overflow-hidden border p-1 bg-[#faf8f0] transition-all focus:outline-none ${
                isActive ? 'border-[#800020] ring-2 ring-[#800020]' : 'border-[#800020]/20 hover:border-[#800020]/60'
              } ${image.isVideo ? 'bg-surface-container-high flex items-center justify-center' : ''}`}
            >
              {image.isVideo ? (
                <Icon name="play_circle" className="text-outline text-sm sm:text-base" />
              ) : (
                <OptimizedImage src={image.url} alt={image.alt} widthPreset="thumbnail" objectFit="contain" className="w-full h-full" loading="lazy" />
              )}
            </button>
          )
        })}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close zoomed view"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="close" className="text-2xl" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation()
                  showPrevImage()
                }}
                className="absolute left-2 sm:left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <Icon name="chevron_left" className="text-2xl" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation()
                  showNextImage()
                }}
                className="absolute right-2 sm:right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <Icon name="chevron_right" className="text-2xl" />
              </button>
            </>
          )}

          <div className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
              src={selectedImage?.url}
              alt={selectedImage?.alt}
              widthPreset="full"
              objectFit="contain"
              className="max-h-[85vh] max-w-[90vw]"
              loading="eager"
            />
          </div>
        </div>
      )}
    </div>
  )
}
