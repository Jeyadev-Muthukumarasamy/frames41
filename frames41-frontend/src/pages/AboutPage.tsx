import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { FOOTER_COLUMNS, NAV_LINKS, SOCIAL_LINKS } from '@/constants/home'

const HIGHLIGHTS = [
  {
    icon: '🎁',
    title: 'Gifts Made Personal',
    description: 'Personalised frames, mugs, art pieces, and wooden engravings crafted for every occasion.',
  },
  {
    icon: '🌟',
    title: 'Trusted Nationwide',
    description: 'Proudly chosen by more than 3,000 happy clients across India.',
  },
  {
    icon: '📦',
    title: 'Delivered Across India',
    description: 'Carefully packed and shipped quickly, so your gift reaches its destination safely and on time.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main id="main-content" className="pt-32 pb-24">
        <section className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary block mb-4">
              The heart behind Frames 41
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl italic mb-6">Our Story</h1>
            <p className="text-on-background/65 text-base sm:text-lg leading-relaxed">
              We believe the best gifts do more than mark an occasion—they preserve a
              feeling, celebrate a bond, and turn a beautiful moment into a lasting memory.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl bg-on-background text-background px-7 py-10 sm:px-14 sm:py-14 mb-14">
            <p className="font-headline text-2xl sm:text-3xl italic leading-relaxed mb-7">
              Thoughtful gifts, made especially for the people who matter.
            </p>
            <div className="space-y-5 text-sm sm:text-base text-white/65 leading-relaxed">
              <p>
                Frames 41 is a gift shop from Pollachi, Tamil Nadu, created with one
                simple idea: every special memory deserves a personal touch. From
                customised photo frames and mugs to expressive art and finely detailed
                wooden engravings, we create keepsakes that feel truly one of a kind.
              </p>
              <p>
                What began as a love for meaningful craftsmanship has grown into the
                trust of 3,000+ happy clients nationwide. Every order is made with care,
                packed securely, and prepared for fast shipping across India—because the
                joy of giving should feel effortless from start to finish.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid gap-5 md:grid-cols-3 mb-16">
            {HIGHLIGHTS.map(({ icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-on-background/10 bg-white/40 p-7"
              >
                <span className="text-2xl block mb-5" aria-hidden="true">{icon}</span>
                <h2 className="font-headline text-xl italic mb-3">{title}</h2>
                <p className="text-sm text-on-background/60 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>

          <div className="max-w-4xl mx-auto border-t border-on-background/10 pt-10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary block mb-3">
              Visit our gift shop
            </span>
            <address className="not-italic text-sm sm:text-base text-on-background/65 leading-relaxed">
              MX7X+P3G, Palaghat Road, Pollachi, Tamil Nadu 642001
            </address>
          </div>
        </section>
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
