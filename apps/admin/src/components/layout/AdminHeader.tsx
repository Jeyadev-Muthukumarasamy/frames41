import { useAuth } from '@/contexts/AuthContext'

interface Props {
  title: string
  onToggleSidebar: () => void
  collapsed: boolean
}

export default function AdminHeader({ title, onToggleSidebar, collapsed }: Props) {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-lg leading-none">{collapsed ? '▶' : '◀'}</span>
        </button>
        <h1 className="text-gray-800 font-semibold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.name ?? 'Admin'}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {(user?.name ?? 'A').charAt(0).toUpperCase()}
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-primary transition-colors border border-gray-200 hover:border-primary px-2.5 py-1 rounded-md"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
