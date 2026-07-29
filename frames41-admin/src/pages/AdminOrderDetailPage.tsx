import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAdminOrderDetail } from '@/hooks/useAdminOrders'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline'
import TrackingModal from '@/components/orders/TrackingModal'
import type { OrderStatus } from '@/types/admin'

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['PAID', 'PROCESSING', 'CANCELLED'],
  PAID:       ['PROCESSING', 'SHIPPED', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED', 'CANCELLED'],
  DELIVERED:  ['REFUNDED'],
  CANCELLED:  [],
  REFUNDED:   [],
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { order, loading, error, updateStatus, addTracking } = useAdminOrderDetail(id!)

  const [trackingOpen, setTrackingOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')
  const [note, setNote] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState('')

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setStatusLoading(true)
    setStatusError('')
    try {
      await updateStatus(newStatus, note || undefined)
      setNewStatus('')
      setNote('')
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-32" />
        ))}
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error ?? 'Order not found'}</p>
        <button onClick={() => navigate('/orders')} className="text-sm text-primary underline">
          Back to orders
        </button>
      </div>
    )
  }

  const allowedTransitions = VALID_TRANSITIONS[order.status] ?? []

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← Orders
          </button>
          <span className="font-mono text-sm font-bold text-primary">{order.orderNumber}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <button
          onClick={() => setTrackingOpen(true)}
          className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {order.tracking ? '✏️ Update Tracking' : '+ Add Tracking'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer & Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Customer</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Name</p>
                <p className="font-medium text-gray-800">{order.user.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="font-medium text-gray-800">{order.user.phone}</p>
              </div>
              {order.user.email && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="font-medium text-gray-800">{order.user.email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Placed</p>
                <p className="font-medium text-gray-800">
                  {format(new Date(order.placedAt), 'dd MMM yyyy, h:mm a')}
                </p>
              </div>
            </div>
            {order.address && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Shipping Address</p>
                <p className="text-sm text-gray-700">
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ''}
                  <br />
                  {order.address.city}, {order.address.state} — {order.address.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Items ({order.items.length})</h3>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-11 w-11 rounded-lg border border-gray-100 object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-xs text-gray-400">{item.variantName}</p>
                          )}
                          {item.customText && (
                            <p className="mt-1 max-w-sm whitespace-pre-wrap text-xs text-gray-600">
                              <span className="font-semibold text-gray-500">Text: </span>
                              {item.customText}
                            </p>
                          )}
                          {item.customImageUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <a
                                href={item.customImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-primary underline"
                              >
                                Open custom image
                              </a>
                              <a
                                href={item.customImageUrl}
                                download
                                className="text-xs font-medium text-primary underline"
                              >
                                Download
                              </a>
                            </div>
                          )}
                          {item.customization && (
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              {Array.isArray(item.customization.names) && (
                                <p><span className="font-semibold">Names:</span> {(item.customization.names as string[]).join(', ')}</p>
                              )}
                              {typeof item.customization.date === 'string' && (
                                <p><span className="font-semibold">Date:</span> {item.customization.date}</p>
                              )}
                              {typeof item.customization.songName === 'string' && (
                                <p><span className="font-semibold">Song:</span> {item.customization.songName}</p>
                              )}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {([
                                  ...(Array.isArray(item.customization.imageUrls) ? item.customization.imageUrls : []),
                                  ...(Array.isArray(item.customization.qrCodeImageUrls) ? item.customization.qrCodeImageUrls : []),
                                ] as string[]).map((url, index) => (
                                  <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt={`Customer customization ${index + 1}`} className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {item.customImageUrl && (
                        <a href={item.customImageUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.customImageUrl}
                            alt={`Customer upload for ${item.productName}`}
                            className="mt-3 h-24 w-24 rounded-lg border border-gray-200 object-cover"
                          />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-gray-600">₹{(item.unitPrice ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">₹{(item.total ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-1.5 bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{(order.subtotal ?? 0).toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>−₹{(order.discount ?? 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>₹{(order.shippingCharge ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{(order.total ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.tracking && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tracking</h3>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">AWB Code</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">{order.tracking.awbCode}</p>
                </div>
                {order.tracking.trackingUrl && (
                  <a
                    href={order.tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Track Shipment →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Update status */}
          {allowedTransitions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
              >
                <option value="">Select new status…</option>
                {allowedTransitions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
              />
              {statusError && <p className="text-xs text-red-600 mb-2">{statusError}</p>}
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || statusLoading}
                className="w-full py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-60"
              >
                {statusLoading ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status History</h3>
            <OrderStatusTimeline history={order.statusHistory} />
          </div>
        </div>
      </div>

      <TrackingModal
        open={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        onSubmit={addTracking}
        existing={order.tracking}
      />
    </div>
  )
}
