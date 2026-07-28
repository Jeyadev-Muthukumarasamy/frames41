import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
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
