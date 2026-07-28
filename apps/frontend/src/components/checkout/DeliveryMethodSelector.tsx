import type { DeliveryMethod } from '../../types/checkout'
import { formatINR } from '../../utils/format'

interface DeliveryMethodOptionProps {
  method: DeliveryMethod
  isSelected: boolean
  onSelect: (id: string) => void
}

function DeliveryMethodOption({ method, isSelected, onSelect }: DeliveryMethodOptionProps) {
  const priceLabel = method.priceInr === null ? 'FREE' : formatINR(method.priceInr)

  return (
    <label className="flex items-center justify-between p-lg border border-[#E2E2DE] bg-white cursor-pointer hover:border-[#111110] transition-colors has-[:checked]:border-primary has-[:checked]:border-2">
      <div className="flex items-center gap-4">
        <input
          type="radio"
          name="delivery-method"
          value={method.id}
          checked={isSelected}
          onChange={() => onSelect(method.id)}
          className="text-primary focus:ring-primary h-4 w-4 accent-primary"
        />
        <div>
          <p className="font-label-bold text-label-bold">{method.name}</p>
          <p className="text-label-sm text-secondary">{method.duration}</p>
        </div>
      </div>
      <p className="font-label-bold text-label-bold">{priceLabel}</p>
    </label>
  )
}

interface DeliveryMethodSelectorProps {
  methods: ReadonlyArray<DeliveryMethod>
  selectedId: string
  onSelect: (id: string) => void
}

export default function DeliveryMethodSelector({
  methods,
  selectedId,
  onSelect,
}: DeliveryMethodSelectorProps) {
  return (
    <section aria-labelledby="delivery-method-heading" className="mt-16">
      <h2
        id="delivery-method-heading"
        className="font-headline-md text-headline-md mb-8"
      >
        Delivery Method
      </h2>

      <div className="space-y-4" role="radiogroup" aria-labelledby="delivery-method-heading">
        {methods.map((method) => (
          <DeliveryMethodOption
            key={method.id}
            method={method}
            isSelected={method.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
