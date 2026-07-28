import type { ProfileAddress } from '../../types/profile'
import ProfileAddressCard from './ProfileAddressCard'

interface ProfileAddressSectionProps {
  addresses: ReadonlyArray<ProfileAddress>
  onAddAddress?: () => void
  onEditAddress: (id: string) => void
  onRemoveAddress: (id: string) => void
  onSetDefaultAddress: (id: string) => void
}

export default function ProfileAddressSection({
  addresses,
  onAddAddress,
  onEditAddress,
  onRemoveAddress,
  onSetDefaultAddress,
}: ProfileAddressSectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="saved-addresses-heading">
      <div className="flex justify-between items-center">
        <h2 id="saved-addresses-heading" className="font-headline-md text-headline-md">
          Saved Addresses
        </h2>
        <button
          type="button"
          onClick={onAddAddress}
          className="border border-[#111110] px-6 py-2 font-label-bold text-label-bold uppercase tracking-widest hover:bg-[#111110] hover:text-white transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            add
          </span>
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {addresses.map((address) => (
          <ProfileAddressCard
            key={address.id}
            address={address}
            onEdit={onEditAddress}
            onRemove={onRemoveAddress}
            onSetDefault={onSetDefaultAddress}
          />
        ))}
      </div>
    </section>
  )
}
