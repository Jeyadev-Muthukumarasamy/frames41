import type { PriceTier } from '@/types/admin'

interface Props {
  tiers: Omit<PriceTier, 'id'>[]
  onChange: (tiers: Omit<PriceTier, 'id'>[]) => void
}

const EMPTY_TIER: Omit<PriceTier, 'id'> = { minQty: 1, maxQty: undefined, pricePerUnit: 0 }

export default function PriceTiersEditor({ tiers, onChange }: Props) {
  const add = () => onChange([...tiers, { ...EMPTY_TIER }])
  const remove = (i: number) => onChange(tiers.filter((_, idx) => idx !== i))
  const update = <K extends keyof Omit<PriceTier, 'id'>>(
    i: number, key: K, value: Omit<PriceTier, 'id'>[K],
  ) => {
    const next = [...tiers]
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Bulk Price Tiers</p>
        <button type="button" onClick={add} className="text-xs font-medium text-primary hover:underline">
          + Add Tier
        </button>
      </div>

      {tiers.length === 0 && (
        <p className="text-sm text-gray-400 italic">No bulk pricing configured.</p>
      )}

      {tiers.map((t, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl relative">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs transition-colors"
          >
            ✕
          </button>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Qty *</label>
            <input
              type="number" min={1} value={t.minQty}
              onChange={(e) => update(i, 'minQty', Number(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Qty</label>
            <input
              type="number" min={1}
              value={t.maxQty ?? ''}
              onChange={(e) => update(i, 'maxQty', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="∞"
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Price/Unit (₹) *</label>
            <input
              type="number" min={0} value={t.pricePerUnit}
              onChange={(e) => update(i, 'pricePerUnit', Number(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
