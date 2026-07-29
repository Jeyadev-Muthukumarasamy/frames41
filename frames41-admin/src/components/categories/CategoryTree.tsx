import type { AdminCategory } from '@/types/admin'

interface Props {
  categories: AdminCategory[]
  onEdit: (cat: AdminCategory) => void
  onDelete: (cat: AdminCategory) => void
  depth?: number
}

export default function CategoryTree({ categories, onEdit, onDelete, depth = 0 }: Props) {
  if (categories.length === 0) return null

  return (
    <ul className={depth === 0 ? 'space-y-2' : 'mt-2 space-y-2 ml-6 border-l border-gray-100 pl-4'}>
      {categories.map((cat) => (
        <li key={cat.id}>
          <div className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              {cat.imageUrl && (
                <img src={cat.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 truncate">/categories/{cat.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {cat.isActive ? 'Active' : 'Inactive'}
              </span>
              {cat.children?.length > 0 && (
                <span className="text-xs text-gray-400">{cat.children.length} sub</span>
              )}
              <button
                onClick={() => onEdit(cat)}
                className="text-xs text-gray-500 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(cat)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          </div>
          {cat.children?.length > 0 && (
            <CategoryTree categories={cat.children} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  )
}
