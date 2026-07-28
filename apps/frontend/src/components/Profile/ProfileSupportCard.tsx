interface ProfileSupportCardProps {
  onContactSupport?: () => void
}

export default function ProfileSupportCard({ onContactSupport }: ProfileSupportCardProps) {
  return (
    <aside className="p-6 bg-white border border-[#E2E2DE] mt-8 rounded-2xl">
      <p className="font-label-bold text-[10px] uppercase text-[#8A8A85] mb-4 tracking-widest">
        Need Help?
      </p>
      <p className="font-headline-md text-xl mb-4">Our concierge is available 24/7.</p>
      <button
        type="button"
        onClick={onContactSupport}
        className="text-[#800020] font-label-bold text-label-bold underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Contact Support
      </button>
    </aside>
  )
}
