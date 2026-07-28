import Icon from '../ui/Icon'

interface BlogPullBlockProps {
  readonly content: string
  readonly attribution: string
}

export default function BlogPullBlock({ content, attribution }: BlogPullBlockProps) {
  return (
    <figure className="py-12 px-8 bg-surface-container-low border border-outline-variant my-16 text-center">
      <Icon name="format_quote" className="text-primary text-5xl mb-6 block" aria-hidden="true" />
      <blockquote>
        <p className="font-headline-lg text-headline-lg italic text-on-surface mb-6">{content}</p>
        <figcaption className="font-label-bold text-label-bold uppercase tracking-widest text-secondary">
          {attribution}
        </figcaption>
      </blockquote>
    </figure>
  )
}
