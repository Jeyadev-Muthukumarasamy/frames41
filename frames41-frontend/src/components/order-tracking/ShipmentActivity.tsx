import type { ShipmentEvent } from '../../types/ordertracking'

interface ShipmentEventRowProps {
  event: ShipmentEvent
}

function ShipmentEventRow({ event }: ShipmentEventRowProps) {
  const { title, location, timestamp, isLatest } = event
  const dotColor = isLatest ? 'bg-[#FF4500]' : 'bg-[#8A8A85]'

  return (
    <li className="flex gap-6">
      <div className="flex flex-col items-center flex-shrink-0" aria-hidden="true">
        <div className={`w-2 h-2 rounded-full ${dotColor} mt-2`} />
        <div className="w-[1px] flex-1 bg-[#E2E2DE] mt-1" />
      </div>
      <div className="pb-6">
        <p className="font-label-bold text-[#111110]">{title}</p>
        <p className="text-body-md text-secondary">{location}</p>
        <p className="text-label-sm text-secondary mt-1">
          <time>{timestamp}</time>
        </p>
      </div>
    </li>
  )
}

interface ShipmentActivityProps {
  events: ReadonlyArray<ShipmentEvent>
}

export default function ShipmentActivity({ events }: ShipmentActivityProps) {
  return (
    <section aria-label="Shipment activity" className="bg-white border border-[#E2E2DE] p-8">
      <h3 className="font-headline-md mb-6 text-[#111110]">Shipment Activity</h3>
      <ol aria-label="Shipment timeline" className="list-none p-0 m-0 space-y-6">
        {events.map((event) => (
          <ShipmentEventRow key={event.id} event={event} />
        ))}
      </ol>
    </section>
  )
}
