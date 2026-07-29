const ANNOUNCEMENT =
  'Crafting Stories in Wood • Free Shipping Above ₹2000 • New Designs Weekly'

export default function AnnouncementBar() {
  return (
    <div
      role="complementary"
      aria-label="Site announcement"
      className="overflow-hidden bg-on-background py-2 text-background"
    >
      <p className="hidden px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] sm:block">
        {ANNOUNCEMENT}
      </p>

      <div className="announcement-marquee flex w-max sm:hidden">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0"
            aria-hidden={copy === 0 ? undefined : true}
          >
            <span className="whitespace-nowrap px-5 text-[10px] font-bold uppercase tracking-[0.2em]">
              {ANNOUNCEMENT}
            </span>
            <span className="px-1 text-[10px]" aria-hidden="true">
              •
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
