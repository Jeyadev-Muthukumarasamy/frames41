import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DashboardStats } from '@/types/admin'

const STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Processing: '#3B82F6',
  Shipped: '#8B5CF6',
  Delivered: '#10B981',
}

interface Props {
  stats: DashboardStats | null
  loading?: boolean
}

export default function StatusDonutChart({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="h-4 w-36 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="flex items-center justify-center h-52">
          <div className="w-40 h-40 rounded-full border-[18px] border-gray-100 animate-pulse" />
        </div>
      </div>
    )
  }

  const data = stats
    ? [
        { name: 'Pending', value: stats.pendingOrders },
        { name: 'Processing', value: stats.processingOrders },
        { name: 'Shipped', value: stats.shippedOrders },
        {
          name: 'Delivered',
          value: Math.max(
            0,
            stats.totalOrders -
              stats.pendingOrders -
              stats.processingOrders -
              stats.shippedOrders,
          ),
        },
      ].filter((d) => d.value > 0)
    : []

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Status Breakdown</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
          No order data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#9CA3AF'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), 'Orders']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
