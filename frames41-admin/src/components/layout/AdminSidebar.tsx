import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/refunds', label: 'Refunds', icon: '↩' },
  { to: '/products', label: 'Products', icon: '🛍' },
  { to: '/categories', label: 'Categories', icon: '🗂' },
  { to: '/banners', label: 'Banners', icon: '🖼' },
  { to: '/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/coupons', label: 'Coupons', icon: '🏷' },
]

export default function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const { pathname } = useLocation()

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white z-40 flex flex-col
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-700 flex-shrink-0">
        {collapsed ? (
          <span className="text-primary font-bold text-xl">F</span>
        ) : (
          <span className="text-white font-bold text-base tracking-wide">
            Frames<span className="text-primary">41</span>
            <span className="ml-2 text-xs text-gray-400 font-normal">Admin</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={() => {
              const active = isActive(to)
              return [
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors duration-150 relative',
                active
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              ].join(' ')
            }}
          >
            {({ isActive: navActive }) => (
              <>
                {navActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                )}
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-700 text-[11px] text-gray-500">
          Admin Portal v1.0
        </div>
      )}
    </aside>
  )
}
