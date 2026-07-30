import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

// Public pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductListingPage = lazy(() => import('@/pages/ProductListingPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const BlogPage = lazy(() => import('@/pages/BlogPage'))
const FAQPage = lazy(() => import('@/pages/FAQPage'))
const GiftCardsPage = lazy(() => import('@/pages/GiftCardsPage'))
const ShippingInfoPage = lazy(() => import('@/pages/ShippingInfoPage'))
const BulkOrdersPage = lazy(() => import('@/pages/BulkOrdersPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))

// Protected pages
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const PaymentPage = lazy(() => import('@/pages/PaymentPage'))
const OrderConfirmPage = lazy(() => import('@/pages/OrderConfirmPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
const ReviewPage = lazy(() => import('@/pages/ReviewPage'))
const ReferPage = lazy(() => import('@/pages/ReferPage'))

// ─── Offline detection banner ─────────────────────────────────────────────────
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      // Hide the "back online" flash after 3 s
      const t = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(t)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md"
      >
        <span className="h-2 w-2 rounded-full bg-white" />
        Back online — your changes will sync automatically.
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-md"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
        No internet connection — some features may be unavailable.
      </div>
    )
  }

  return null
}

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <OfflineBanner />
          <Toaster position="top-right" richColors />
          <Suspense fallback={<div className="min-h-screen bg-[#f8f7f2]" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ProductListingPage />} />
            <Route path="/shop/:slug" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/gift-cards" element={<GiftCardsPage />} />
            <Route path="/shipping" element={<ShippingInfoPage />} />
            <Route path="/contact/bulk" element={<BulkOrdersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/shop/bestsellers" element={<ProductListingPage />} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/:orderId" element={<P><PaymentPage /></P>} />
            <Route path="/order-confirm/:orderId" element={<P><OrderConfirmPage /></P>} />
            <Route path="/orders" element={<P><OrdersPage /></P>} />
            <Route path="/orders/:orderNumber" element={<P><OrderTrackingPage /></P>} />
            <Route path="/profile" element={<P><ProfilePage /></P>} />
            <Route path="/wishlist" element={<P><WishlistPage /></P>} />
            <Route path="/reviews" element={<P><ReviewPage /></P>} />
            <Route path="/refer" element={<P><ReferPage /></P>} />
          </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
