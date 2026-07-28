import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'

const DENOMINATIONS = [500, 1000, 2000, 5000]

export default function GiftCardsPage() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main className="pt-32 pb-24 max-w-container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary block mb-4">
            Give the Gift of Art
          </span>
          <h1 className="font-headline text-4xl italic mb-6">Gift Cards</h1>
          <p className="text-on-background/60 text-base leading-relaxed">
            Give someone the freedom to choose their perfect frame. Our digital gift cards are delivered instantly by email and never expire.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {DENOMINATIONS.map((amount) => (
            <div
              key={amount}
              className="border border-on-background/10 rounded-lg p-8 text-center hover:border-primary hover:shadow-md transition-all cursor-pointer group"
            >
              <p className="text-xs uppercase tracking-widest text-on-background/50 mb-2">Gift Card</p>
              <p className="font-headline text-3xl italic group-hover:text-primary transition-colors">
                ₹{amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface-variant rounded-xl p-8 md:p-12 grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: '✉️', title: 'Instant Delivery', desc: "Sent to the recipient's inbox within minutes of purchase." },
            { icon: '♾️', title: 'Never Expires', desc: 'Our gift cards have no expiry date — use them whenever you like.' },
            { icon: '🎨', title: 'Any Product', desc: 'Redeemable on anything in the Frames41 store, including custom orders.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-on-background mb-1">{title}</h3>
                <p className="text-sm text-on-background/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-on-background/50 text-sm mb-6">
            Gift card purchases are processed through our checkout. Select a denomination above to proceed.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="border border-on-background/20 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-on-background hover:text-white transition-colors rounded-full"
          >
            Browse Products Instead
          </button>
        </div>
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
