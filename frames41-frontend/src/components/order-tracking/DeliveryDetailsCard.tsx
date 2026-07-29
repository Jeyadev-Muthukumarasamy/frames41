import type { DeliveryInfo } from '../../types/ordertracking'
import Icon from '../ui/Icon'

interface DeliveryDetailsCardProps {
  delivery: DeliveryInfo
}

export default function DeliveryDetailsCard({ delivery }: DeliveryDetailsCardProps) {
  const { address, contact, estimatedDelivery } = delivery

  return (
    <section aria-label="Delivery details" className="bg-white border border-[#E2E2DE] p-8 rounded-2xl">
      <h3 className="font-headline-md mb-6 text-[#111110]">Delivery Details</h3>

      <div className="space-y-8">
        <div>
          <p className="font-label-bold text-secondary text-xs uppercase tracking-widest mb-3">
            Shipping Address
          </p>
          <address className="font-body-md text-[#111110] leading-relaxed not-italic">
            {address.recipientName}
            <br />
            {address.streetLine1}
            <br />
            {address.streetLine2}
            <br />
            {address.stateAndCountry}
          </address>
        </div>

        <div>
          <p className="font-label-bold text-secondary text-xs uppercase tracking-widest mb-3">
            Contact Information
          </p>
          <address className="font-body-md text-[#111110] not-italic">
            <a
              href={`mailto:${contact.email}`}
              className="hover:underline underline-offset-2 transition-all"
            >
              {contact.email}
            </a>
            <br />
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className="hover:underline underline-offset-2 transition-all"
            >
              {contact.phone}
            </a>
          </address>
        </div>

        <div>
          <p className="font-label-bold text-secondary text-xs uppercase tracking-widest mb-3">
            Estimated Delivery
          </p>
          <div className="flex items-center gap-2">
            <Icon name="calendar_today" className="text-[#FF4500]" aria-hidden />
            <span className="font-label-bold text-[#111110]">{estimatedDelivery}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
