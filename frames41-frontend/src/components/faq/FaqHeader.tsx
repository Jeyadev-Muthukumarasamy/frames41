interface FaqHeaderProps {
  onContactSupport?: () => void
}

export default function FaqHeader({ onContactSupport }: FaqHeaderProps) {
  return (
    <header className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="max-w-2xl">
        <span
          aria-label="Section: Help Center"
          className="text-label-bold text-primary uppercase mb-4 block tracking-widest"
        >
          Help Center
        </span>
        <h1 className="font-headline-lg text-display-xl text-on-surface leading-none mb-6">
          Frequently Asked Questions.
        </h1>
        <p className="font-body-lg text-secondary max-w-xl">
          Find answers to common inquiries about our handcrafted collections, shipping logistics,
          and bespoke customization process. We are here to ensure your Frames 41 experience is
          seamless.
        </p>
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={onContactSupport}
          className="bg-primary text-white font-label-bold px-8 py-4 uppercase tracking-widest transition-transform hover:scale-[0.98] active:opacity-80"
        >
          Contact Support
        </button>
      </div>
    </header>
  )
}
