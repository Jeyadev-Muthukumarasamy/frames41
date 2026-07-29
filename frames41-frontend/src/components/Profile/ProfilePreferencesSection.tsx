interface ProfilePreferencesSectionProps {
  isNewsletterSubscribed: boolean
  onToggle: () => void
}

export default function ProfilePreferencesSection({
  isNewsletterSubscribed,
  onToggle,
}: ProfilePreferencesSectionProps) {
  return (
    <section className="border border-outline-variant rounded-lg p-6 bg-white">
      <h2 className="font-headline text-xl text-on-background mb-6">Preferences</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Newsletter Subscription</p>
            <p className="text-xs text-secondary mt-1">
              Receive updates on new arrivals, offers, and exclusive content.
            </p>
          </div>
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isNewsletterSubscribed ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isNewsletterSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
