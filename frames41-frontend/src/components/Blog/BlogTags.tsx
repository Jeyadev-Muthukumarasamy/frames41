import type { BlogTag } from '../../types/blog'

interface BlogTagsProps {
  readonly tags: ReadonlyArray<BlogTag>
}

export default function BlogTags({ tags }: BlogTagsProps) {
  return (
    <ul
      className="pt-12 flex flex-wrap gap-2 list-none m-0 p-0"
      aria-label="Article tags"
    >
      {tags.map(({ label }) => (
        <li
          key={label}
          className="bg-[#EEEEEC] text-[#111110] px-4 py-2 text-[12px] font-label-bold uppercase tracking-widest"
        >
          {label}
        </li>
      ))}
    </ul>
  )
}
