import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { adaptProductListing } from '@/lib/adapters'
import type { ProductListingProduct, ProductListingSortKey, ProductListingCategory } from '@/types/productListing'

export function useProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse URL params into primitives (strings / numbers / booleans)
  const sort = (searchParams.get('sort') as ProductListingSortKey) ?? 'featured'
  const categoryIdsStr = searchParams.getAll('categoryId').join(',')
  const minPriceRaw = searchParams.get('minPrice')
  const maxPriceRaw = searchParams.get('maxPrice')
  const minRatingRaw = searchParams.get('minRating')
  const inStockOnly = searchParams.get('inStock') === 'true'
  const searchQuery = searchParams.get('q') ?? ''

  const minPrice = minPriceRaw ? Number(minPriceRaw) : null
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null
  const minRating = minRatingRaw ? Number(minRatingRaw) : null
  const categoryIds = categoryIdsStr ? categoryIdsStr.split(',') : []

  // Stable key that only changes when query-string filters change
  const filterKey = `${sort}||${categoryIdsStr}||${minPriceRaw ?? ''}||${maxPriceRaw ?? ''}||${minRatingRaw ?? ''}||${inStockOnly}||${searchQuery}`

  const [products, setProducts] = useState<ProductListingProduct[]>([])
  const [categories, setCategories] = useState<ProductListingCategory[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Fetch categories once
  useEffect(() => {
    let cancelled = false
    setCategoriesLoading(true)
    api.categories
      .getTree({ isActive: true })
      .then((res: unknown) => {
        if (cancelled) return
        const data = (res as any[] | undefined) ?? []
        setCategories(data.map((c) => ({ id: c.id, label: c.name })))
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Fetch products whenever filterKey changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params: Record<string, unknown> = { limit: 20, sort }
    if (categoryIds.length === 1) params.categoryId = categoryIds[0]
    else if (categoryIds.length > 1) params.categoryIds = categoryIds.join(',')
    if (minPrice !== null) params.minPrice = minPrice
    if (maxPrice !== null) params.maxPrice = maxPrice
    if (minRating !== null) params.minRating = minRating
    if (inStockOnly) params.inStock = true
    if (searchQuery.trim()) params.q = searchQuery.trim()

    api.products
      .getProducts(params)
      .then((res: unknown) => {
        if (cancelled) return
        const data = res as any
        const items = (data?.products ?? data?.data ?? data ?? []).map(adaptProductListing)
        setProducts(items)
        setCursor(data?.nextCursor ?? null)
        setHasMore(data?.hasMore ?? false)
      })
      .catch(() => {
        // keep existing state
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [filterKey])

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)

    const params: Record<string, unknown> = { limit: 20, sort, cursor }
    if (categoryIds.length === 1) params.categoryId = categoryIds[0]
    else if (categoryIds.length > 1) params.categoryIds = categoryIds.join(',')
    if (minPrice !== null) params.minPrice = minPrice
    if (maxPrice !== null) params.maxPrice = maxPrice
    if (minRating !== null) params.minRating = minRating
    if (inStockOnly) params.inStock = true
    if (searchQuery.trim()) params.q = searchQuery.trim()

    try {
      const res = (await api.products.getProducts(params)) as any
      const items = (res?.products ?? res?.data ?? res ?? []).map(adaptProductListing)
      setProducts((prev) => [...prev, ...items])
      setCursor(res?.nextCursor ?? null)
      setHasMore(res?.hasMore ?? false)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }, [cursor, loadingMore, sort, categoryIdsStr, minPrice, maxPrice, minRating, inStockOnly, searchQuery])

  const updateFilters = useCallback(
    (updates: {
      categoryIds?: string[]
      minPrice?: number | null
      maxPrice?: number | null
      minRating?: number | null
      inStockOnly?: boolean
      searchQuery?: string
      sort?: ProductListingSortKey
    }) => {
      const next = new URLSearchParams(searchParams)

      // Clear pagination cursor on filter change
      next.delete('cursor')

      if (updates.categoryIds !== undefined) {
        next.delete('categoryId')
        updates.categoryIds.forEach((id) => next.append('categoryId', id))
      }
      if (updates.minPrice !== undefined) {
        if (updates.minPrice === null || Number.isNaN(updates.minPrice)) next.delete('minPrice')
        else next.set('minPrice', String(updates.minPrice))
      }
      if (updates.maxPrice !== undefined) {
        if (updates.maxPrice === null || Number.isNaN(updates.maxPrice)) next.delete('maxPrice')
        else next.set('maxPrice', String(updates.maxPrice))
      }
      if (updates.minRating !== undefined) {
        if (updates.minRating === null || Number.isNaN(updates.minRating)) next.delete('minRating')
        else next.set('minRating', String(updates.minRating))
      }
      if (updates.inStockOnly !== undefined) {
        if (updates.inStockOnly) next.set('inStock', 'true')
        else next.delete('inStock')
      }
      if (updates.searchQuery !== undefined) {
        if (updates.searchQuery.trim()) next.set('q', updates.searchQuery.trim())
        else next.delete('q')
      }
      if (updates.sort !== undefined) {
        next.set('sort', updates.sort)
      }

      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return {
    products,
    categories,
    loading,
    loadingMore,
    categoriesLoading,
    hasMore,
    loadMore,
    filters: {
      categoryIds,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      searchQuery,
      sort,
    },
    updateFilters,
  }
}
