import { format } from 'date-fns'
import type { AdminBanner, BannerType } from '@/types/admin'
import { BANNER_TYPE_LABELS } from '@/types/admin'

interface Props {
  banners: AdminBanner[]
  onEdit: (b: AdminBanner) => void
  onDelete: (b: AdminBanner) => void
  onToggle: (b: AdminBanner) => void
}

const TYPE_ORDER: BannerType[] = ['TOP_STRIP', 'HEADER_SLIDER', 'UNDER_999', 'CATEGORY_BANNER', 'PROMOTIONAL']

export default function BannerGrid({ banners, onEdit, onDelete, onToggle }: Props) {
  const grouped = TYPE_ORDER.reduce<Record<BannerType, AdminBanner[]>>(
    (acc, t) => ({ ...acc, [t]: banners.filter((b) => b.type === t) }),
    {} as Record<BannerType, AdminBanner[]>,
  )

  return (
    <div className="space-y-8">
      {TYPE_ORDER.map((type) => {
        const group = grouped[type]
        return (
          <div key={type}>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              {BANNER_TYPE_LABELS[type]} ({group.length})
            </h3>
            {group.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4">No banners of this type.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                    <div className="relative h-36 bg-gray-100">
                      <img src={b.imageUrl} alt={b.title ?? b.type} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{b.title || '(no title)'}</p>
                          {b.subtitle && <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>}
                        </div>
                        <button
                          onClick={() => onToggle(b)}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                            b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {b.isActive ? 'Active' : 'Off'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <span>Sort: {b.sortOrder}</span>
                        {b.startDate && (
                          <span className="ml-2">
                            {format(new Date(b.startDate), 'dd MMM')} → {b.endDate ? format(new Date(b.endDate), 'dd MMM') : '∞'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(b)} className="flex-1 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => onDelete(b)} className="flex-1 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
