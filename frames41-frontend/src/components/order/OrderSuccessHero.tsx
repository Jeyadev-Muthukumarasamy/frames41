import Icon from '../ui/Icon'

interface OrderSuccessHeroProps {
  onTrackOrder?: () => void
  onContinueShopping?: () => void
}

export default function OrderSuccessHero({
  onTrackOrder,
  onContinueShopping,
}: OrderSuccessHeroProps) {
  return (
    <section
      aria-labelledby="confirm-heading"
      className="flex flex-col items-center text-center mb-16"
    >
      <div
        aria-hidden="true"
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
      >
        <Icon name="check_circle" className="text-primary text-4xl" />
      </div>

      <h1 id="confirm-heading" className="text-headline-lg text-on-background mb-4">
        Thank You for Your Order
      </h1>
      <p className="text-body-lg text-on-surface-variant mb-8 max-w-2xl">
        Your handcrafted pieces are being prepared by our master artisans. We've sent a
        confirmation email to your inbox.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={onTrackOrder}
          className="bg-primary text-on-primary text-label-bold px-10 py-4 uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-primary/10"
        >
          Track Order
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="border border-on-background text-on-background text-label-bold px-10 py-4 uppercase tracking-widest hover:bg-on-background hover:text-surface transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </section>
  )
}
