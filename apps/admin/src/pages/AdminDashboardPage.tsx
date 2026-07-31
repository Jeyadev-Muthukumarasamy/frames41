import { useState, useCallback } from 'react'
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

  const handlePeriodChange = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod)
    if (newPeriod === 'custom' && (!startDate || !endDate)) {
      const today = new Date()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)

      setEndDate(today.toISOString().split('T')[0])
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
    }
  }, [startDate, endDate])

  const { stats, analytics, topProducts, loading, error } = useAdminDashboard(
    period,
    startDate,
    endDate,
  )

  const isCustomIncomplete = period === 'custom' && (!startDate || !endDate)

  return (
    <div className="space-y-6">
      {/* Period selector - Always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodSelector
          value={period}
          onChange={handlePeriodChange}
          startDate={startDate}
          endDate={endDate}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
        />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center min-h-64 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 text-lg font-bold">
            !
          </div>
          <p className="text-red-600 font-semibold text-sm mb-1">{error}</p>
          <p className="text-gray-400 text-xs">
            Please pick a valid start & end date or switch to a preset time period above.
          </p>
        </div>
      ) : isCustomIncomplete ? (
        <div className="flex flex-col items-center justify-center min-h-64 bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 text-lg font-bold">
            📅
          </div>
          <p className="text-gray-800 font-semibold text-sm mb-1">
            Please Select Custom Date Range
          </p>
          <p className="text-gray-500 text-xs">
            Choose both a start date and an end date above to filter analytics and statistics.
          </p>
        </div>
      ) : (
        <>
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
                {period === 'custom' ? `Custom Range (${startDate} to ${endDate})` : period} — Analytics Summary
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusDonutChart stats={stats} loading={loading} />
            <TopProductsChart products={topProducts} loading={loading} />
          </div>

          {/* Top Products Table */}
          <TopProductsTable products={topProducts} loading={loading} />
        </>
      )}
    </div>
  )
}
