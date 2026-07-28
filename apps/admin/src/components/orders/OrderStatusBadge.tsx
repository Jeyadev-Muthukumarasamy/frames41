import type { OrderStatus } from '@/types/admin'

const CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:    { label: 'Pending',    className: 'bg-yellow-100 text-yellow-800' },
  PAID:       { label: 'Paid',       className: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  SHIPPED:    { label: 'Shipped',    className: 'bg-purple-100 text-purple-800' },
  DELIVERED:  { label: 'Delivered',  className: 'bg-green-100 text-green-800' },
  CANCELLED:  { label: 'Cancelled',  className: 'bg-red-100 text-red-800' },
  REFUNDED:   { label: 'Refunded',   className: 'bg-gray-100 text-gray-600' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
