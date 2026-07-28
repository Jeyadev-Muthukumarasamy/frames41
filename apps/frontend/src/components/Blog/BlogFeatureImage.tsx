import type { BlogImage } from '../../types/blog'

interface BlogFeatureImageProps {
  readonly image: BlogImage
}

export default function BlogFeatureImage({ image }: BlogFeatureImageProps) {
  return (
    <div className="w-full h-[716px] relative overflow-hidden">
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
