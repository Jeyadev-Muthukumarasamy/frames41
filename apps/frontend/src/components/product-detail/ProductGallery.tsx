import { useState } from 'react'
import type { ProductImage } from '../../types/productDetail'
import Icon from '../ui/Icon'

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectedImage = images[selectedIndex]
  const thumbnails = images.slice(1)

  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/30">
        {selectedImage?.isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <Icon name="play_circle" className="text-outline text-4xl sm:text-6xl" />
          </div>
        ) : (
          <img
            src={selectedImage?.url}
            alt={selectedImage?.alt}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
      </div>

      <div
        role="tablist"
        aria-label="Product images"
        className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-4"
      >
        {thumbnails.map((image, i) => {
          const index = i + 1
          const isActive = selectedIndex === index

          return (
            <button
              key={image.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-label={image.isVideo ? 'Play video' : image.alt}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? 'border-primary' : 'border-outline-variant hover:border-primary/50'
              } ${image.isVideo ? 'bg-surface-container-high flex items-center justify-center' : ''}`}
            >
              {image.isVideo ? (
                <Icon name="play_circle" className="text-outline text-sm sm:text-base" />
              ) : (
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
