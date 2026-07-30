import { useState } from 'react'
import type { ProductImage } from '../../types/productDetail'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectedImage = images[selectedIndex]

  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <div className="aspect-square rounded-2xl overflow-hidden bg-[#faf8f0] border border-[#800020]/20 p-2 flex items-center justify-center shadow-inner">
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
                <OptimizedImage
                  src={image.url}
                  alt={image.alt}
                  widthPreset="thumbnail"
                  objectFit="contain"
                  className="w-full h-full"
                  loading="lazy"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
