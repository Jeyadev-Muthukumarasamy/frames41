interface ShimmerProps {
  readonly className?: string
  readonly dark?: boolean
}

export function Shimmer({ className = '', dark = false }: ShimmerProps) {
  return (
    <span
      aria-hidden="true"
      className={`shimmer block overflow-hidden rounded-xl ${
        dark ? 'shimmer-dark' : 'bg-on-background/10'
      } ${className}`}
    />
  )
}

interface ProductSectionShimmerProps {
  readonly title?: string
  readonly eyebrow?: string
  readonly count?: number
  readonly layout?: 'carousel' | 'grid' | 'wide'
  readonly dark?: boolean
}

export default function ProductSectionShimmer({
  title,
  eyebrow,
  count = 4,
  layout = 'grid',
  dark = false,
}: ProductSectionShimmerProps) {
  const isCarousel = layout === 'carousel' || layout === 'wide'
  const imageClass = 'aspect-square'

  return (
    <section
      aria-label={`${title ?? 'Products'} loading`}
      aria-busy="true"
      className={dark ? 'bg-on-background text-background py-16 sm:py-xl' : 'py-16 sm:py-xl'}
    >
      <span className="sr-only">Loading products…</span>
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className={`${dark ? 'text-center' : 'border-b border-on-background/10'} mb-8 sm:mb-12 pb-6 sm:pb-8`}>
          {eyebrow && (
            <p className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase mb-1">
              {eyebrow}
            </p>
          )}
          {title ? (
            <h2 className="font-headline text-[28px] sm:text-headline-lg italic">{title}</h2>
          ) : (
            <Shimmer dark={dark} className={`h-10 w-48 ${dark ? 'mx-auto' : ''}`} />
          )}
        </div>

        <div
          className={
            isCarousel
              ? 'flex gap-4 sm:gap-8 overflow-hidden'
              : 'grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8'
          }
        >
          {Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              className={
                layout === 'wide'
                  ? 'min-w-[280px] sm:min-w-[400px]'
                  : layout === 'carousel'
                    ? 'min-w-[220px] sm:min-w-[300px]'
                    : index >= 4
                      ? 'hidden md:block'
                      : ''
              }
            >
              <Shimmer dark={dark} className={`${imageClass} w-full mb-4 rounded-2xl`} />
              <Shimmer dark={dark} className={`h-4 w-3/4 mb-3 ${layout !== 'wide' ? 'mx-auto' : ''}`} />
              <Shimmer dark={dark} className={`h-3 w-1/3 ${layout !== 'wide' ? 'mx-auto' : ''}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
