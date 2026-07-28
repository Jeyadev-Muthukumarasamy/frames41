import type { ReactNode } from 'react'
import type { BlogSection, BlogShareLink, BlogTag } from '../../types/blog'
import BlogImageGrid from './BlogImageGrid'
import BlogLeadQuote from './BlogLeadQuote'
import BlogPullBlock from './BlogPullBlock'
import BlogShareSidebar from './BlogShareSidebar'
import BlogTags from './BlogTags'

interface BlogArticleBodyProps {
  readonly sections: ReadonlyArray<BlogSection>
  readonly tags: ReadonlyArray<BlogTag>
  readonly shareLinks: ReadonlyArray<BlogShareLink>
}

const SECTION_RENDERERS: Record<string, (section: BlogSection) => ReactNode> = {
  'lead-quote': (s) => <BlogLeadQuote content={s.content ?? ''} />,
  paragraph: (s) => (
    <p className="font-body-md text-body-md text-on-surface-variant leading-[1.8]">
      {s.content}
    </p>
  ),
  heading: (s) => (
    <h2 className="font-headline-md text-headline-md text-on-surface mt-16 mb-6">{s.content}</h2>
  ),
  'pull-block': (s) => (
    <BlogPullBlock content={s.content ?? ''} attribution={s.attribution ?? ''} />
  ),
  'image-grid': (s) => <BlogImageGrid images={s.images ?? []} />,
}

export default function BlogArticleBody({ sections, tags, shareLinks }: BlogArticleBodyProps) {
  return (
    <article className="max-w-4xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <BlogShareSidebar shareLinks={shareLinks} />

        <div className="md:col-span-9 space-y-12">
          {sections.map((section) => {
            const render = SECTION_RENDERERS[section.type]
            return (
              <section key={section.id} aria-label={section.type}>
                {render?.(section)}
              </section>
            )
          })}
          <BlogTags tags={tags} />
        </div>
      </div>
    </article>
  )
}
