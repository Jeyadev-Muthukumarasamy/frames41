interface ProfileNewsletterSectionProps {
  isSubscribed: boolean
  onToggle: () => void
}

export default function ProfileNewsletterSection({
  isSubscribed,
  onToggle,
}: ProfileNewsletterSectionProps) {
  return (
    <section
      className="bg-[#EEEEEC] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-md">
        <h2 id="newsletter-heading" className="font-headline-md text-2xl mb-2">
          Member Exclusives
        </h2>
        <p className="text-[#5f5e5d] font-body-md">
          Get early access to artisan drops and limited edition collections directly in your inbox.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span
          id="newsletter-toggle-label"
          className="font-label-bold text-label-bold text-[#111110] uppercase"
        >
          {isSubscribed ? 'Subscribed' : 'Unsubscribed'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isSubscribed}
          aria-labelledby="newsletter-toggle-label"
          onClick={onToggle}
          className={[
            'w-14 h-8 rounded-full relative flex items-center px-1 cursor-pointer',
            'transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            isSubscribed ? 'bg-[#111110]' : 'bg-[#8A8A85]',
          ].join(' ')}
        >
          <span
            className={[
              'w-6 h-6 bg-white rounded-full transition-transform duration-300',
              isSubscribed ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')}
            aria-hidden="true"
          />
          <span className="sr-only">
            {isSubscribed
              ? 'Unsubscribe from member exclusives'
              : 'Subscribe to member exclusives'}
          </span>
        </button>
      </div>
    </section>
  )
}
