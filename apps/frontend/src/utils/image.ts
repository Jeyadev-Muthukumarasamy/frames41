/**
 * Helper utility to optimize image URLs and route Google Drive images through
 * high-performance backend proxy for instant Amazon/Flipkart speed.
 */

const preloadedUrls = new Set<string>()

export function preloadImage(url: string | undefined | null) {
  if (!url || typeof url !== 'string' || preloadedUrls.has(url)) return
  preloadedUrls.add(url)
  const img = new Image()
  img.src = url
}

export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: { width?: number; quality?: number; format?: 'auto' | 'webp' | 'jpg' } = {},
): string {
  if (!url || typeof url !== 'string') return ''

  const { width = 450, quality = 80, format = 'auto' } = options

  if (url.startsWith('/api/v1/images/proxy')) return url

  // Google Drive & proxy URL optimization
  if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (matchId && matchId[1]) {
      const proxyUrl = `/api/v1/images/proxy?id=${matchId[1]}`
      if (typeof window !== 'undefined') {
        preloadImage(proxyUrl)
      }
      return proxyUrl
    }
  }

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

export function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    if (file.size <= 300 * 1024) {
      resolve(file)
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return }
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        resolve(compressedFile)
      }, 'image/jpeg', quality)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}
