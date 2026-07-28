import ReferCodeBox from './ReferCodeBox'

interface ReferHeroProps {
  code: string
  imageUrl: string
  imageAlt: string
}

export default function ReferHero({ code, imageUrl, imageAlt }: ReferHeroProps) {
  return (
    <section
      aria-labelledby="refer-hero-heading"
      className="max-w-container-max mx-auto px-6 md:px-12 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center"
    >
      <div className="space-y-6">
        <span className="inline-block px-3 py-1 bg-surface-container text-on-background font-label-bold text-label-sm uppercase tracking-widest">
          Rewards Program
        </span>

        <h1
          id="refer-hero-heading"
          className="font-display-xl text-display-xl leading-tight text-on-background"
        >
          Share the craft,
          <br />
          <span className="text-primary">Earn together.</span>
        </h1>

        <p className="text-body-lg font-body-lg text-secondary max-w-lg">
          Invite your circle to the world of Frames 41 Handcrafted. When they make their first
          purchase, you both receive exclusive artisanal credit.
        </p>

        <div className="pt-8 space-y-4">
          <p className="font-label-bold text-label-sm text-on-surface-variant uppercase tracking-widest">
            Your Referral Code
          </p>
          <ReferCodeBox code={code} />
        </div>
      </div>

      <div className="relative" aria-hidden="true">
        <div className="aspect-[4/5] bg-surface-container-lowest border border-outline-variant p-4 rotate-2 translate-x-4 translate-y-4 absolute inset-0 z-0" />
        <div className="aspect-[4/5] overflow-hidden border border-outline-variant relative z-10">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
