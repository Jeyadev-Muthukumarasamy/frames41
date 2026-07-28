import { useCallback, useState } from 'react'
import type { ProductTabId } from '@/types/productDetail'
import { useCart } from '@/contexts/CartContext'

const MIN_QTY = 1
const MAX_QTY = 99

interface UseProductDetailReturn {
  readonly quantity: number
  readonly activeTab: ProductTabId
  readonly isWishlisted: boolean
  increment: () => void
  decrement: () => void
  setActiveTab: (tab: ProductTabId) => void
  toggleWishlist: () => void
  addToCart: () => void
}

export function useProductDetail(productId: string): UseProductDetailReturn {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<ProductTabId>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  const increment = useCallback(() => setQuantity((q) => Math.min(q + 1, MAX_QTY)), [])
  const decrement = useCallback(() => setQuantity((q) => Math.max(q - 1, MIN_QTY)), [])
  const toggleWishlist = useCallback(() => setIsWishlisted((w) => !w), [])

  const addToCart = useCallback(() => {
    addItem(productId, quantity)
  }, [productId, quantity, addItem])

  return {
    quantity,
    activeTab,
    isWishlisted,
    increment,
    decrement,
    setActiveTab,
    toggleWishlist,
    addToCart,
  }
}
