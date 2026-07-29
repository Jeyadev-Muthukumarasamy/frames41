import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminProductDetail } from '@/hooks/useAdminProducts'
import { useAdminCategories } from '@/hooks/useAdminCategories'
import ProductForm from '@/components/products/ProductForm'
import type { ProductFormData } from '@/types/admin'

export default function AdminProductEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const { product, loading: productLoading, error, save } = useAdminProductDetail(isNew ? undefined : id)
  const { categories } = useAdminCategories()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: ProductFormData) => {
    setSaving(true)
    try {
      await save(data)
      navigate('/products')
    } finally {
      setSaving(false)
    }
  }

  if (!isNew && productLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-32" />
        ))}
      </div>
    )
  }

  if (!isNew && (error || !product)) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-red-100">
        <p className="text-sm text-red-600">{error ?? 'Product could not be loaded.'}</p>
        <button onClick={() => navigate('/products')} className="mt-3 text-sm text-primary hover:underline">
          Back to products
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <button onClick={() => navigate('/products')} className="text-sm text-gray-500 hover:text-primary transition-colors">
        ← Products
      </button>
      <ProductForm
        initial={isNew ? null : product}
        categories={categories}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  )
}
