import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptWishlistItem } from '@/lib/adapters'
import { useAuth } from '@/contexts/AuthContext'
import type { WishlistItem } from '@/types/wishlist'

export function useWishlist() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(isAuthenticated)
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      setWishlistedIds(new Set())
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await api.wishlist.get() as any[]
      const adapted = raw.map(adaptWishlistItem)
      setItems(adapted)
      setWishlistedIds(new Set(adapted.map((i) => i.id)))
    } catch {
      setItems([])
      setWishlistedIds(new Set())
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const toggle = useCallback(async (productId: string) => {
    if (!isAuthenticated) return
    await api.wishlist.toggle(productId)
    await fetchWishlist()
  }, [fetchWishlist, isAuthenticated])

  const remove = useCallback(async (productId: string) => {
    if (!isAuthenticated) return
    await api.wishlist.remove(productId)
    setItems((prev) => prev.filter((i) => i.id !== productId))
    setWishlistedIds((prev) => { const s = new Set(prev); s.delete(productId); return s })
  }, [isAuthenticated])

  const isWishlisted = useCallback((productId: string) => wishlistedIds.has(productId), [wishlistedIds])

  return { items, loading, toggle, remove, isWishlisted }
}