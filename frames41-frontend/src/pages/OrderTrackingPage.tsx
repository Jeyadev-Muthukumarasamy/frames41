import { useParams } from 'react-router-dom'
import { useOrderTracking } from '@/hooks/useOrderTracking'
import OrderTracking from '@/components/order-tracking/OrderTracking'

export default function OrderTrackingPage() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>()
  const { data, loading, error } = useOrderTracking(orderNumber)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B6B6B]">{error ?? 'Order not found'}</p>
      </div>
    )
  }

  return <OrderTracking data={data} />
}
