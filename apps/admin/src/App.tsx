import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import AdminGuard from '@/components/shared/AdminGuard'
import AdminLayout from '@/components/layout/AdminLayout'
import LoginPage from '@/pages/LoginPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminOrdersPage from '@/pages/AdminOrdersPage'
import AdminOrderDetailPage from '@/pages/AdminOrderDetailPage'
import AdminCustomersPage from '@/pages/AdminCustomersPage'
import AdminCustomerDetailPage from '@/pages/AdminCustomerDetailPage'
import AdminRefundsPage from '@/pages/AdminRefundsPage'
import AdminProductsPage from '@/pages/AdminProductsPage'
import AdminProductEditPage from '@/pages/AdminProductEditPage'
import AdminCategoriesPage from '@/pages/AdminCategoriesPage'
import AdminBannersPage from '@/pages/AdminBannersPage'
import AdminReviewsPage from '@/pages/AdminReviewsPage'
import AdminCouponsPage from '@/pages/AdminCouponsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/orders" element={<AdminOrdersPage />} />
            <Route path="/orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="/customers" element={<AdminCustomersPage />} />
            <Route path="/customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="/refunds" element={<AdminRefundsPage />} />
            <Route path="/products" element={<AdminProductsPage />} />
            <Route path="/products/new" element={<AdminProductEditPage />} />
            <Route path="/products/:id/edit" element={<AdminProductEditPage />} />
            <Route path="/categories" element={<AdminCategoriesPage />} />
            <Route path="/banners" element={<AdminBannersPage />} />
            <Route path="/reviews" element={<AdminReviewsPage />} />
            <Route path="/coupons" element={<AdminCouponsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
