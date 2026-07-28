import Icon from '../ui/Icon'

interface AddNewAddressCardProps {
  onAdd: () => void
}

export default function AddNewAddressCard({ onAdd }: AddNewAddressCardProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Add a new shipping address"
      className={[
        'border-2 border-dashed border-[#E2E2DE] p-lg w-full min-h-[220px] rounded-2xl',
        'flex flex-col items-center justify-center',
        'hover:border-primary group transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      ].join(' ')}
    >
      <Icon
        name="add_circle"
        className="text-3xl text-[#8A8A85] group-hover:text-primary mb-4 transition-colors"
      />
      <span className="font-label-bold text-label-bold text-[#111110] uppercase">
        Add New Address
      </span>
    </button>
  )
}
