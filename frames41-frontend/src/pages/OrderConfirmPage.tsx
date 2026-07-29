import { useParams, useNavigate } from 'react-router-dom'
import { useOrderDetail } from '@/hooks/useOrders'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OrderSuccessHero from '@/components/order/OrderSuccessHero'
import OrderSummary from '@/components/order/OrderSummary'
import OrderSupportPanel from '@/components/order/OrderSupportPanel'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'
import { ORDER_STEPS, SUPPORT_EMAIL } from '@/constants/order'

export default function OrderConfirmPage() {
  const { orderId = '' } = useParams<{ orderId: string }>()
  const { order, loading } = useOrderDetail(orderId)
  const navigate = useNavigate()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-primary focus:rounded"
      >
        Skip to main content
      </a>
      <Navbar links={NAV_LINKS} />
      <main id="main-content" className="pt-32 pb-24 max-w-container mx-auto px-6">
        <OrderSuccessHero
          onTrackOrder={() => order && navigate(`/orders/${order.orderNumber}`)}
          onContinueShopping={() => navigate('/shop')}
        />
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : order && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-outline-variant pt-16">
            <div className="lg:col-span-7">
              <OrderSummary order={order} />
            </div>
            <div className="lg:col-span-5">
              <OrderSupportPanel steps={ORDER_STEPS} supportEmail={SUPPORT_EMAIL} />
            </div>
          </div>
        )}
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
