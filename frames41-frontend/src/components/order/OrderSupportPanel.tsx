import type { OrderStep } from '../../types/order'
import OrderProgressTracker from './OrderProgressTracker'

interface OrderSupportPanelProps {
  steps: ReadonlyArray<OrderStep>
  supportEmail: string
}

export default function OrderSupportPanel({ steps, supportEmail }: OrderSupportPanelProps) {
  return (
    <aside
      aria-label="Order status and support"
      className="bg-surface border border-outline-variant p-8 md:p-12 sticky top-28"
    >
      <h3 className="text-headline-md text-on-background mb-10">What Happens Next</h3>
      <OrderProgressTracker steps={steps} />

      <div className="mt-12 pt-12 border-t border-outline-variant">
        <p className="text-body-md text-on-surface-variant mb-4 italic">
          Need to make a change?
        </p>
        <p className="text-body-md text-on-background">
          Contact our concierge at{' '}
          <a
            href={`mailto:${supportEmail}`}
            className="underline decoration-primary underline-offset-4 hover:text-primary transition-colors"
          >
            {supportEmail}
          </a>{' '}
          within 24 hours.
        </p>
      </div>
    </aside>
  )
}
