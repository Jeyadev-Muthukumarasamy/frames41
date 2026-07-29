interface ReferUpgradeCTAProps {
  onUpgrade?: () => void
}

export default function ReferUpgradeCTA({ onUpgrade }: ReferUpgradeCTAProps) {
  return (
    <section
      aria-labelledby="upgrade-cta-heading"
      className="max-w-container-max mx-auto px-6 md:px-12 py-12 md:py-24"
    >
      <div className="bg-surface-container-low border border-outline-variant p-12 md:p-24 text-center space-y-8">
        <h2
          id="upgrade-cta-heading"
          className="font-display-xl text-display-xl text-on-background"
        >
          Need more invites?
        </h2>

        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
          Elite tier members receive unlimited referral benefits and early access to our quarterly
          artisan drops. Upgrade your artisanal journey today.
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onUpgrade}
            className="bg-primary text-on-primary px-12 py-5 font-label-bold text-label-bold uppercase hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Upgrade to Elite
          </button>
        </div>
      </div>
    </section>
  )
}
