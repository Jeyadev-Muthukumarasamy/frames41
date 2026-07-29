import type { MouseEvent } from 'react'
import type { RelatedStory } from '../../types/blog'
import BlogRelatedCard from './BlogRelatedCard'

interface BlogRelatedStoriesProps {
  readonly stories: ReadonlyArray<RelatedStory>
  readonly onViewJournal?: () => void
}

export default function BlogRelatedStories({ stories, onViewJournal }: BlogRelatedStoriesProps) {
  const handleViewJournal = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewJournal) {
      e.preventDefault()
      onViewJournal()
    }
  }

  return (
    <section
      className="bg-[#F8F8F6] py-24 border-t border-[#E2E2DE]"
      aria-labelledby="related-stories-heading"
    >
      <div className="max-w-container-max mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <h2 id="related-stories-heading" className="font-headline-lg text-headline-lg">
            Related Stories
          </h2>
          <a
            href="#"
            onClick={handleViewJournal}
            className="font-label-bold text-label-bold text-primary border-b border-primary pb-1 uppercase"
          >
            View Journal
          </a>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none m-0 p-0">
          {stories.map((story) => (
            <li key={story.id}>
              <BlogRelatedCard
                category={story.category}
                title={story.title}
                image={story.image}
                href={story.href}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
