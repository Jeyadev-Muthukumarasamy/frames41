import type { ShippingAddress } from '../../types/checkout'
import AddressCard from './AddressCard'
import AddNewAddressCard from './AddNewAddressCard'
import AddressFormInline, { type AddressFormData } from './AddressFormInline'

interface AddressGridProps {
  addresses: ReadonlyArray<ShippingAddress>
  selectedId: string
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onAdd: () => void
  showForm?: boolean
  onSaveForm?: (data: AddressFormData) => Promise<unknown>
  onCancelForm?: () => void
}

export default function AddressGrid({
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onAdd,
  showForm,
  onSaveForm,
  onCancelForm,
}: AddressGridProps) {
  return (
    <section aria-labelledby="shipping-address-heading">
      <h2
        id="shipping-address-heading"
        className="font-headline-md text-headline-md mb-8"
      >
        Shipping Address
      </h2>

      {showForm && onSaveForm && onCancelForm ? (
        <AddressFormInline onSave={onSaveForm} onCancel={onCancelForm} />
      ) : (
        <div
          role="radiogroup"
          aria-labelledby="shipping-address-heading"
          className="grid grid-cols-1 md:grid-cols-2 gap-gutter"
        >
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={address.id === selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))}
          <AddNewAddressCard onAdd={onAdd} />
        </div>
      )}
    </section>
  )
}