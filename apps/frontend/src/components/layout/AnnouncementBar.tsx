const ANNOUNCEMENT =
  'Crafting Stories in Wood • Free Shipping Above ₹999 • Express Dispatch Across India'

export default function AnnouncementBar() {
  return (
    <div
      role="complementary"
      aria-label="Site announcement"
      className="overflow-hidden bg-gradient-to-r from-[#380b17] via-[#541122] to-[#380b17] border-b border-rose-500/30 py-2.5 text-amber-200 shadow-sm"
    >
      <p className="hidden px-4 text-center text-[11px] font-extrabold uppercase tracking-[0.22em] sm:block text-amber-200">
        {ANNOUNCEMENT}
      </p>

      <div className="announcement-marquee flex w-max sm:hidden">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0"
            aria-hidden={copy === 0 ? undefined : true}
          >
            <span className="whitespace-nowrap px-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-200">
              {ANNOUNCEMENT}
            </span>
            <span className="px-1 text-[10px] text-amber-400" aria-hidden="true">
              •
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
