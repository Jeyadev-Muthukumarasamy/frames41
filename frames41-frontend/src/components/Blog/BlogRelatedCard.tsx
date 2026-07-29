import type { RelatedStory } from '../../types/blog'

type BlogRelatedCardProps = Pick<RelatedStory, 'category' | 'title' | 'image' | 'href'>

export default function BlogRelatedCard({ category, title, image, href }: BlogRelatedCardProps) {
  return (
    <article className="group cursor-pointer">
      <a href={href} aria-label={`Read article: ${title}`}>
        <div className="aspect-[4/5] overflow-hidden mb-6 bg-white border border-[#E2E2DE] rounded-2xl">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="font-label-sm text-[#8A8A85] uppercase tracking-widest mb-2">{category}</p>
        <h3 className="font-headline-md text-headline-md group-hover:text-primary transition-colors">
          {title}
        </h3>
      </a>
    </article>
  )
}
