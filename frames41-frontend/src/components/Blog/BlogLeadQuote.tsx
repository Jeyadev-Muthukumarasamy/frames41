interface BlogLeadQuoteProps {
  readonly content: string
}

export default function BlogLeadQuote({ content }: BlogLeadQuoteProps) {
  return (
    <blockquote className="font-body-lg text-body-lg text-on-surface leading-relaxed italic border-l-4 border-primary pl-8">
      {content}
    </blockquote>
  )
}
