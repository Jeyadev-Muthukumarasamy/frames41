import type { ProfileUser } from '../../types/profile'

interface PersonalField {
  readonly label: string
  readonly value: string
}

interface ProfilePersonalInfoProps {
  user: ProfileUser
  onEdit?: () => void
}

function PersonalInfoField({ label, value }: PersonalField) {
  return (
    <div className="space-y-1">
      <dt className="font-label-sm text-label-sm text-[#8A8A85] uppercase">{label}</dt>
      <dd className="font-body-lg text-body-lg text-[#111110] py-2 border-b border-[#EEEEEC]">
        {value}
      </dd>
    </div>
  )
}

export default function ProfilePersonalInfo({ user, onEdit }: ProfilePersonalInfoProps) {
  const fields: ReadonlyArray<PersonalField> = [
    { label: 'Legal Name', value: user.legalName },
    { label: 'Email Address', value: user.email },
    { label: 'Phone Number', value: user.phone },
    { label: 'Timezone', value: user.timezone },
  ]

  return (
    <section
      className="bg-white border border-[#E2E2DE] p-8 md:p-12"
      aria-labelledby="personal-info-heading"
    >
      <div className="flex justify-between items-center mb-10">
        <h2 id="personal-info-heading" className="font-headline-md text-headline-md">
          Personal Information
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 text-[#8A8A85] hover:text-[#111110] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Edit personal information"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
          <span className="font-label-bold text-label-bold uppercase">Edit</span>
        </button>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {fields.map((field) => (
          <PersonalInfoField key={field.label} label={field.label} value={field.value} />
        ))}
      </dl>
    </section>
  )
}
