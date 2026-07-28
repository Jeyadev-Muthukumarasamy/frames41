import type { BlogMeta } from '../../types/blog'

interface BlogHeroProps {
  readonly title: string
  readonly meta: BlogMeta
}

export default function BlogHero({ title, meta }: BlogHeroProps) {
  return (
    <header className="max-w-container-max mx-auto px-6 py-16 md:py-24 text-center">
      <div className="mb-6">
        <span className="bg-[#EEEEEC] text-[#111110] px-3 py-1 text-[12px] font-bold tracking-widest uppercase">
          {meta.category}
        </span>
      </div>

      <h1 className="font-display-xl text-display-xl max-w-4xl mx-auto mb-8 leading-tight">
        {title}
      </h1>

      <div
        className="flex items-center justify-center gap-4 text-[#8A8A85] font-label-sm uppercase tracking-widest"
        aria-label="Article metadata"
      >
        <span>
          By{' '}
          {meta.author.href ? (
            <a href={meta.author.href} className="hover:text-primary transition-colors">
              {meta.author.name}
            </a>
          ) : (
            meta.author.name
          )}
        </span>
        <span className="w-1 h-1 bg-primary rounded-full" aria-hidden="true" />
        <time dateTime={meta.publishedAt}>{meta.publishedAt}</time>
        <span className="w-1 h-1 bg-primary rounded-full" aria-hidden="true" />
        <span>{meta.readTimeMinutes} Min Read</span>
      </div>
    </header>
  )
}
