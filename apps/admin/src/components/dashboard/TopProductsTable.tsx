import type { TopProduct } from '@/types/admin'

interface Props {
  products: TopProduct[]
  loading?: boolean
}

export default function TopProductsTable({ products, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-3 border-b border-gray-50 flex gap-4">
            <div className="h-4 w-5 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Top 10 Products</h3>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-8">#</th>
            <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Units</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.slice(0, 10).map((p, i) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
              <td className="px-5 py-3 text-gray-800 font-medium max-w-xs truncate">{p.name}</td>
              <td className="px-5 py-3 text-right font-semibold text-gray-900">
                ₹{p.totalRevenue.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-right text-gray-600">{p.totalSold}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">
                No product data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
