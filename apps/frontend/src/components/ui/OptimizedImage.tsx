import { useState } from 'react'
import { getOptimizedImageUrl } from '@/utils/image'

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  alt?: string
  widthPreset?: 'thumbnail' | 'card' | 'banner' | 'full'
  customWidth?: number
  className?: string
  fallbackSrc?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
}

const PRESET_WIDTHS = {
  thumbnail: 200,
  card: 450,
  banner: 1200,
  full: 1600,
}

const SVG_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-size="10" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EProduct%3C/text%3E%3C/svg%3E'

export default function OptimizedImage({
  src,
  alt = 'Product image',
  widthPreset = 'card',
  customWidth,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  fallbackSrc,
  objectFit = 'contain',
  onError,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false)

  const targetWidth = customWidth ?? PRESET_WIDTHS[widthPreset]
  const optimizedSrc = getOptimizedImageUrl(src, { width: targetWidth, quality: 80, format: 'auto' })

  const isCdn = src && (src.includes('unsplash.com') || src.includes('cloudinary.com'))
  const srcSet = isCdn
    ? `${getOptimizedImageUrl(src, { width: Math.round(targetWidth * 0.5), quality: 75, format: 'auto' })} ${Math.round(targetWidth * 0.5)}w, ` +
      `${getOptimizedImageUrl(src, { width: targetWidth, quality: 80, format: 'auto' })} ${targetWidth}w, ` +
      `${getOptimizedImageUrl(src, { width: Math.round(targetWidth * 1.5), quality: 85, format: 'auto' })} ${Math.round(targetWidth * 1.5)}w`
    : undefined

  const sizes = isCdn
    ? `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${targetWidth}px`
    : undefined

  const objectFitClass =
    objectFit === 'cover'
      ? 'object-cover'
      : objectFit === 'fill'
      ? 'object-fill'
      : objectFit === 'none'
      ? 'object-none'
      : 'object-contain'

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      <img
        src={error || !src ? fallbackSrc || SVG_FALLBACK : optimizedSrc}
        srcSet={error || !src ? undefined : srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={(e) => {
          onLoad?.(e)
        }}
        onError={(e) => {
          setError(true)
          onError?.(e)
        }}
        className={`max-h-full max-w-full ${objectFitClass}`}
        {...props}
      />
    </div>
  )
}
