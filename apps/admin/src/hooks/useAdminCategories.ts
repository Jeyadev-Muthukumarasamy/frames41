import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminCategory, CategoryFormData } from '@/types/admin'

export function useAdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getCategoryTree(true)
      setCategories(data as AdminCategory[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createCategory = useCallback(async (data: CategoryFormData) => {
    await api.admin.createCategory(data)
    await fetch()
  }, [fetch])

  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>) => {
    await api.admin.updateCategory(id, data)
    await fetch()
  }, [fetch])

  const deleteCategory = useCallback(async (id: string) => {
    await api.admin.deleteCategory(id)
    await fetch()
  }, [fetch])

  return { categories, loading, error, createCategory, updateCategory, deleteCategory, refresh: fetch }
}
