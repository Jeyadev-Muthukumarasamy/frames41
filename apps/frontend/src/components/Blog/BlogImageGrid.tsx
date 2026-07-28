import type { BlogImage } from '../../types/blog'

interface BlogImageGridProps {
  readonly images: ReadonlyArray<BlogImage>
}

export default function BlogImageGrid({ images }: BlogImageGridProps) {
  return (
    <ul
      className="grid grid-cols-2 gap-4 my-12 list-none m-0 p-0"
      aria-label="Article images"
    >
      {images.map((image) => (
        <li key={image.src}>
          <img
            src={image.src}
            alt={image.alt}
            className="w-full aspect-square object-cover"
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  )
}
