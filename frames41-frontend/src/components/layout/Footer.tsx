import type { FooterColumn, SocialLink } from '../../types/home'
import Icon from '../ui/Icon'

interface FooterProps {
  columns: ReadonlyArray<FooterColumn>
  socialLinks: ReadonlyArray<SocialLink>
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case 'mail':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    default:
      return <Icon name={name} />
  }
}

export default function Footer({ columns, socialLinks }: FooterProps) {
  return (
    <footer className="bg-on-background text-background border-t border-white/5">
      <div className="max-w-container mx-auto px-4 sm:px-8 pt-16 sm:pt-xl pb-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-16 mb-12 sm:mb-20">
          <div className="col-span-1">
            <a
              href="/"
              aria-label="Frames 41 home"
              className="text-3xl font-headline italic mb-8 block"
            >
              Frames 41
            </a>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              Bringing the timeless beauty of raw materials into modern living through
              conscious craftsmanship.
            </p>
            <nav aria-label="Social media links">
              <ul className="flex gap-6 list-none m-0 p-0">
                {socialLinks.map(({ icon, href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      aria-label={label}
                      rel="noopener noreferrer"
                      target={href.startsWith('http') ? '_blank' : undefined}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <SocialIcon name={icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-white text-label-bold mb-8 uppercase text-[10px] tracking-[0.3em]">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-4 list-none m-0 p-0 text-sm text-white/40">
                {col.links.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Frames 41 Co. All Rights Reserved.
          </p>
          <div className="flex gap-6 grayscale opacity-30" aria-hidden="true">
            <Icon name="credit_card" className="text-xl" />
            <Icon name="account_balance" className="text-xl" />
            <Icon name="token" className="text-xl" />
          </div>
        </div>
      </div>
    </footer>
  )
}
