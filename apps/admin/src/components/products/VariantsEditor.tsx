import type { ProductVariant } from '@/types/admin'

interface Props {
  variants: Omit<ProductVariant, 'id'>[]
  onChange: (variants: Omit<ProductVariant, 'id'>[]) => void
}

const EMPTY_VARIANT: Omit<ProductVariant, 'id'> = {
  name: '',
  sku: '',
  priceModifier: 0,
  stock: 0,
  imageUrl: '',
}

export default function VariantsEditor({ variants, onChange }: Props) {
  const add = () => onChange([...variants, { ...EMPTY_VARIANT }])

  const remove = (i: number) => onChange(variants.filter((_, idx) => idx !== i))

  const update = <K extends keyof Omit<ProductVariant, 'id'>>(
    i: number,
    key: K,
    value: Omit<ProductVariant, 'id'>[K],
  ) => {
    const next = [...variants]
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Variants</p>
        <button
          type="button"
          onClick={add}
          className="text-xs font-medium text-primary hover:underline"
        >
          + Add Variant
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-gray-400 italic">No variants. This is a simple product.</p>
      )}

      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl relative">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs transition-colors"
          >
            ✕
          </button>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name *</label>
            <input
              value={v.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. 30×40cm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">SKU *</label>
            <input
              value={v.sku ?? ''}
              onChange={(e) => update(i, 'sku', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Price Modifier (₹)</label>
            <input
              type="number"
              value={v.priceModifier}
              onChange={(e) => update(i, 'priceModifier', Number(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Stock</label>
            <input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => update(i, 'stock', Number(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
