import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'

const SECTIONS = [
  {
    heading: 'Delivery Timeframes',
    rows: [
      ['Metro cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad)', '2–3 business days'],
      ['Tier-2 cities & large towns', '3–5 business days'],
      ['Remote / rural areas', '5–7 business days'],
      ['Custom / personalised orders', '+1–2 extra business days'],
    ],
  },
  {
    heading: 'Shipping Charges',
    rows: [
      ['Orders above ₹999', 'FREE shipping'],
      ['Orders below ₹999', '₹79 flat'],
      ['Express delivery (where available)', '₹149 flat'],
    ],
  },
  {
    heading: 'Order Processing',
    rows: [
      ['Standard orders', 'Dispatched within 1 business day'],
      ['Personalised / custom orders', 'Dispatched within 2–3 business days'],
      ['Order cut-off time', '2:00 PM IST (Mon–Sat)'],
    ],
  },
]

const FAQS = [
  {
    q: 'Can I track my order?',
    a: 'Yes — once dispatched you will receive an email with a tracking link. You can also track your order on the Orders page after logging in.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship only within India. International shipping is coming soon — sign up for our newsletter to be the first to know.',
  },
  {
    q: 'What if my order arrives damaged?',
    a: 'All our frames are packed with double-layered protective foam. If something arrives damaged, email us within 48 hours with photos and we will replace it at no cost.',
  },
  {
    q: 'Can I change my shipping address after placing an order?',
    a: 'Address changes can be made within 2 hours of placing an order. Contact us at support@frames41.com with your order number.',
  },
]

export default function ShippingInfoPage() {
  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main className="pt-32 pb-24 max-w-container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary block mb-4">
            Delivery
          </span>
          <h1 className="font-headline text-4xl italic mb-6">Shipping Information</h1>
          <p className="text-on-background/60 text-base leading-relaxed">
            We partner with Delhivery and BlueDart to ensure your frames arrive safely across all 33 Indian states.
          </p>
        </div>

        <div className="space-y-12 max-w-3xl mx-auto mb-16">
          {SECTIONS.map(({ heading, rows }) => (
            <div key={heading}>
              <h2 className="font-headline text-xl italic mb-4 border-b border-on-background/10 pb-3">
                {heading}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-on-background/5 last:border-0">
                      <td className="py-3 pr-6 text-on-background/70 w-3/5">{label}</td>
                      <td className="py-3 font-semibold text-on-background">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline text-xl italic mb-6 border-b border-on-background/10 pb-3">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold text-on-background mb-2">{q}</h3>
                <p className="text-sm text-on-background/60 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
