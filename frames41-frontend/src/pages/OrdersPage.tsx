import { useNavigate } from 'react-router-dom'
import { useOrderList } from '@/hooks/useOrders'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'

export default function OrdersPage() {
  const { orders, loading, hasMore, loadMore } = useOrderList()
  const navigate = useNavigate()

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main className="pt-32 pb-24 px-6 max-w-container mx-auto">
        <h1 className="text-2xl font-semibold mb-8">My Orders</h1>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6B6B6B] mb-4">You haven't placed any orders yet.</p>
            <button onClick={() => navigate('/shop')} className="text-sm text-[#800020] underline">
              Start shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.orderNumber}`)}
                className="w-full text-left border border-[#E0E0E0] rounded-xl p-6 hover:border-[#800020] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{order.total.toLocaleString('en-IN')}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F8F8F6] text-[#6B6B6B] mt-1 inline-block">
                      {order.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button onClick={loadMore} className="text-sm text-[#800020] underline">
                  Load more orders
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
