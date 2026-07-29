import Icon from '../ui/Icon'

interface ChatFabProps {
  onClick?: () => void
}

export default function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat support"
      className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 z-40 bg-on-background text-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center high-contrast-shadow hover:scale-110 active:scale-95 transition-all"
    >
      <Icon name="chat" />
    </button>
  )
}
