/**
 * Helper utility to optimize image URLs by injecting resolution, quality, and format flags
 * to minimize payload transfer size and prevent network congestion.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: { width?: number; quality?: number; format?: 'auto' | 'webp' | 'jpg' } = {},
): string {
  if (!url || typeof url !== 'string') return ''

  const { width = 450, quality = 80, format = 'auto' } = options

  // Unsplash URL optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url)
      parsed.searchParams.set('w', width.toString())
      parsed.searchParams.set('q', quality.toString())
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('fit', 'crop')
      return parsed.toString()
    } catch {
      return url
    }
  }

  // Cloudinary URL optimization
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const transform = `c_scale,w_${width},q_${quality},f_${format}`
    return url.replace('/upload/', `/upload/${transform}/`)
  }

  return url
}
