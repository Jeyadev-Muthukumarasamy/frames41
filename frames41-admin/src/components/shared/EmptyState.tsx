interface Props {
  icon?: string
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  message = 'No results match your current filters.',
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
