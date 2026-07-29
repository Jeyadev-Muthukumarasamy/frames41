import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAdminCustomerDetail } from '@/hooks/useAdminCustomers'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import type { OrderStatus } from '@/types/admin'

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { customer, loading, error } = useAdminCustomerDetail(id!)

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-36" />
        ))}
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error ?? 'Customer not found'}</p>
        <button onClick={() => navigate('/customers')} className="text-sm text-primary underline">
          Back to customers
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate('/customers')} className="text-sm text-gray-500 hover:text-primary transition-colors">
        ← Customers
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {(customer.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{customer.name ?? 'No name'}</h2>
            <p className="text-sm text-gray-500">{customer.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="font-medium text-gray-800">{customer.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Joined</p>
            <p className="font-medium text-gray-800">{format(new Date(customer.createdAt), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{customer.totalOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Lifetime Value</p>
            <p className="text-xl font-bold text-primary">₹{customer.totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {customer.addresses.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Addresses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customer.addresses.map((addr) => (
              <div key={addr.id} className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                <p>{addr.line1}</p>
                <p>{addr.city}, {addr.state} — {addr.pincode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Order History ({customer.orders.length})</h3>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customer.orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => navigate(`/orders/${o.id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{o.orderNumber}</td>
                <td className="px-5 py-3"><OrderStatusBadge status={o.status as OrderStatus} /></td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">₹{o.total.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-xs text-gray-500">
                  {format(new Date(o.placedAt), 'dd MMM yyyy')}
                </td>
              </tr>
            ))}
            {customer.orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
