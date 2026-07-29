import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/shared/ToastContainer'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/refunds': 'Refunds',
  '/products': 'Products',
  '/products/new': 'New Product',
  '/categories': 'Categories',
  '/banners': 'Banners',
  '/coupons': 'Coupons',
  '/reviews': 'Reviews',
}

function resolveTitle(pathname: string): string {
  if (pathname.match(/^\/orders\/.+/)) return 'Order Detail'
  if (pathname.match(/^\/customers\/.+/)) return 'Customer Detail'
  if (pathname.match(/^\/products\/.+\/edit$/)) return 'Edit Product'
  return PAGE_TITLES[pathname] ?? 'Admin'
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()

  const sidebarWidth = collapsed ? 64 : 224

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar collapsed={collapsed} />

        <div
          className="flex-1 flex flex-col min-w-0 transition-all duration-200"
          style={{ marginLeft: sidebarWidth }}
        >
          <AdminHeader
            title={resolveTitle(pathname)}
            onToggleSidebar={() => setCollapsed((c) => !c)}
            collapsed={collapsed}
          />
          <main className="flex-1 p-5 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastContainer />
    </ToastProvider>
  )
}
