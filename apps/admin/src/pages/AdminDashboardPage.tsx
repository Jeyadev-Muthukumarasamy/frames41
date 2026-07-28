import { useState } from 'react'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import StatsCard from '@/components/dashboard/StatsCard'
import PeriodSelector from '@/components/dashboard/PeriodSelector'
import StatusDonutChart from '@/components/dashboard/StatusDonutChart'
import TopProductsChart from '@/components/dashboard/TopProductsChart'
import TopProductsTable from '@/components/dashboard/TopProductsTable'
import type { Period } from '@/types/admin'

function fmt(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toLocaleString()}`
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { stats, analytics, topProducts, loading, error } = useAdminDashboard(
    period,
    startDate,
    endDate,
  )

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodSelector
          value={period}
          onChange={setPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
        />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Revenue" value={stats ? fmt(stats.totalRevenue) : '—'} loading={loading} accent />
        <StatsCard label="Today Revenue" value={stats ? fmt(stats.todayRevenue) : '—'} loading={loading} />
        <StatsCard label="Total Orders" value={stats?.totalOrders.toLocaleString() ?? '—'} loading={loading} />
        <StatsCard label="Today Orders" value={stats?.todayOrders.toLocaleString() ?? '—'} loading={loading} />
        <StatsCard label="Total Users" value={stats?.totalUsers.toLocaleString() ?? '—'} loading={loading} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="Pending Orders" value={stats?.pendingOrders ?? '—'} loading={loading} />
        <StatsCard label="Low Stock" value={stats?.lowStockProducts ?? '—'} loading={loading} />
        <StatsCard label="Pending Reviews" value={stats?.pendingReviews ?? '—'} loading={loading} />
        <StatsCard label="Pending Refunds" value={stats?.pendingRefunds ?? '—'} loading={loading} />
        {analytics && (
          <StatsCard
            label="AOV"
            value={fmt(analytics.aov)}
            sub={`${analytics.totalOrders} orders`}
            loading={loading}
          />
        )}
      </div>

      {/* Analytics summary */}
      {analytics && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 capitalize">
            {period === 'custom' ? 'Custom range' : period} — Analytics Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">GMV</p>
              <p className="text-xl font-bold text-gray-900">{fmt(analytics.gmv)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900">{fmt(analytics.aov)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Orders</p>
              <p className="text-xl font-bold text-gray-900">{analytics.totalOrders.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
              <p className="text-xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StatusDonutChart stats={stats} loading={loading} />
        <TopProductsChart products={topProducts} loading={loading} />
      </div>

      {/* Top products table */}
      <TopProductsTable products={topProducts} loading={loading} />
    </div>
  )
}
