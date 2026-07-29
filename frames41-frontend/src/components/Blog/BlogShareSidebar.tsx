import type { BlogShareLink } from '../../types/blog'

interface BlogShareSidebarProps {
  readonly shareLinks: ReadonlyArray<BlogShareLink>
}

export default function BlogShareSidebar({ shareLinks }: BlogShareSidebarProps) {
  return (
    <aside className="md:col-span-3 hidden md:block" aria-label="Share article">
      <div className="sticky top-32 space-y-8">
        <div>
          <p className="font-label-bold text-label-bold text-on-surface mb-2" aria-hidden="true">
            SHARE
          </p>
          <nav aria-label="Share links">
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {shareLinks.map(({ label, href, rel }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel={rel ?? 'noopener noreferrer'}
                    target="_blank"
                    aria-label={`Share on ${label}`}
                    className="text-[#8A8A85] hover:text-primary transition-colors text-sm uppercase tracking-widest"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  )
}
