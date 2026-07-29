import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: ToastItem
  onRemove: (id: string) => void
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [progress, setProgress] = useState(100)
  const duration = 4000

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onRemove(toast.id)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [toast.id, onRemove])

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-md transform transition-all duration-300 animate-in slide-in-from-right ${STYLES[toast.type]}`}
      role="alert"
    >
      <span className="text-lg shrink-0">{ICONS[toast.type]}</span>
      <p className="text-sm font-medium pr-6">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-2 right-2 text-xs opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 rounded-b-xl transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
