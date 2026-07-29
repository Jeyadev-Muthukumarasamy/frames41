import { useNavigate } from 'react-router-dom'
import { useOrderList } from '@/hooks/useOrders'

export default function ProfileOrdersSection() {
  const { orders, loading, hasMore, loadMore } = useOrderList()
  const navigate = useNavigate()

  return (
    <section className="border border-outline-variant rounded-lg p-6 bg-white">
      <h2 className="font-headline text-xl text-on-background mb-6">Order History</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-secondary mb-4">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/shop')}
            className="text-sm text-primary underline hover:no-underline"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.orderNumber}`)}
              className="w-full text-left border border-outline-variant rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">₹{order.total.toLocaleString('en-IN')}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-secondary mt-1 inline-block">
                    {order.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button onClick={loadMore} className="text-sm text-primary underline">
                Load more orders
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
