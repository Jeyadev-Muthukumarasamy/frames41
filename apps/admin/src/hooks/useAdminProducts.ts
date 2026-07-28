import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminProductListItem, AdminProductDetail, ProductFormData, PaginatedMeta } from '@/types/admin'

interface ProductFilters {
  page: number
  limit: number
  search?: string
  categoryId?: string
  isActive?: boolean
  lowStock?: boolean
}

export function useAdminProducts(filters: ProductFilters) {
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.admin.getProducts(filters)
      setProducts(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters.page, filters.limit, filters.search, filters.categoryId, filters.isActive, filters.lowStock]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  const deleteProduct = useCallback(async (id: string) => {
    await api.admin.deleteProduct(id)
    await fetch()
  }, [fetch])

  const toggleActive = useCallback(async (id: string, current: boolean) => {
    await api.admin.updateProduct(id, { isActive: !current })
    await fetch()
  }, [fetch])

  return { products, meta, loading, error, deleteProduct, toggleActive, refresh: fetch }
}

export function useAdminProductDetail(id?: string) {
  const [product, setProduct] = useState<AdminProductDetail | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    api.admin.getProductById(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [id])

  const save = useCallback(async (data: ProductFormData): Promise<AdminProductDetail> => {
    if (id) {
      const updated = await api.admin.updateProduct(id, data)
      setProduct(updated)
      return updated
    }
    return api.admin.createProduct(data)
  }, [id])

  return { product, loading, error, save }
}
