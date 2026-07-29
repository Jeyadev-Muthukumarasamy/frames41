import type { WishlistBanner } from '../../types/wishlist'
import Icon from '../ui/Icon'

interface WishlistFeaturedSectionProps {
  banner: WishlistBanner
}

export default function WishlistFeaturedSection({ banner }: WishlistFeaturedSectionProps) {
  const { imageUrl, imageAlt, title, body, linkHref, linkLabel } = banner

  return (
    <section
      aria-label="Featured content"
      className="mt-section grid grid-cols-1 md:grid-cols-3 gap-lg h-auto md:h-[400px]"
    >
      <div className="md:col-span-2 bg-on-background p-xl flex flex-col justify-end relative overflow-hidden group">
        <img
          src={imageUrl}
          alt={imageAlt}
          width={800}
          height={400}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="relative z-10">
          <h2 className="font-headline-lg text-headline-md text-white mb-md">{title}</h2>
          <p className="font-body-md text-secondary-fixed text-body-md max-w-md mb-lg">{body}</p>
          <a
            href={linkHref}
            className="inline-flex items-center gap-sm font-label-bold text-label-bold uppercase text-white hover:text-[#800020] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-on-background"
          >
            {linkLabel}
            <Icon name="arrow_right_alt" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="bg-surface-container flex flex-col items-center justify-center p-xl border border-outline-variant text-center">
        <Icon
          name="verified"
          className="text-[48px] text-[#800020] mb-md"
          aria-label="Verified warranty"
        />
        <h2 className="font-headline-md text-[24px] mb-sm">Lifetime Warranty</h2>
        <p className="font-body-md text-secondary text-label-sm uppercase tracking-widest">
          On all artisan frames
        </p>
      </div>
    </section>
  )
}
