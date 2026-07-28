import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { adaptCart } from '@/lib/adapters'
import { useAuth } from './AuthContext'
import type { CartData, CartLineItem } from '@/types/shipping'

interface CartContextValue {
  itemCount: number
  cartData: CartData | null
  isLoading: boolean
  refresh: () => Promise<void>
  addItem: (productId: string, quantity: number, variantId?: string, customization?: Record<string, unknown>, customImageUrl?: string) => Promise<void>
  updateItem: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

interface GuestCartItem extends CartLineItem {
  productId: string
  customization?: Record<string, unknown>
  customImageUrl?: string
}

const GUEST_CART_KEY = 'frames41_guest_cart'
const CartContext = createContext<CartContextValue | null>(null)

function readGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) as GuestCartItem[] : []
  } catch {
    return []
  }
}

function writeGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}


function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

async function uploadGuestCustomization(customization?: Record<string, unknown>) {
  if (!customization) return { customization: undefined, customImageUrl: undefined as string | undefined }

  const next: Record<string, unknown> = { ...customization }
  let customImageUrl: string | undefined
  const imageDataUrls = Array.isArray(next.imageDataUrls) ? next.imageDataUrls as string[] : []
  const qrCodeImageDataUrls = Array.isArray(next.qrCodeImageDataUrls) ? next.qrCodeImageDataUrls as string[] : []

  if (imageDataUrls.length) {
    const imageUrls = await Promise.all(
      imageDataUrls.map(async (dataUrl, index) => (await api.cart.uploadPhoto(dataUrlToFile(dataUrl, `custom-${index}.png`))).url),
    )
    next.imageUrls = imageUrls
    customImageUrl = imageUrls[0]
  }

  if (qrCodeImageDataUrls.length) {
    next.qrCodeImageUrls = await Promise.all(
      qrCodeImageDataUrls.map(async (dataUrl, index) => (await api.cart.uploadPhoto(dataUrlToFile(dataUrl, `qr-${index}.png`))).url),
    )
  }

  delete next.imageDataUrls
  delete next.qrCodeImageDataUrls

  return { customization: next, customImageUrl }
}
function toCartData(items: GuestCartItem[]): CartData {
  return {
    items,
    charges: { shippingInr: 0, taxInr: 0, discountInr: 0 },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function productToGuestItem(product: any, quantity: number, customization?: Record<string, unknown>, customImageUrl?: string): GuestCartItem {
  const image = customImageUrl || product.productImage || product.imageUrl || product.images?.[0]?.url || ''
  const price = Number(product.discountedPrice ?? product.basePrice ?? product.priceInr ?? product.price ?? 0)
  return {
    id: `guest-${product.id}`,
    productId: product.id,
    name: product.name ?? product.productName ?? 'Product',
    variant: '',
    priceInr: price,
    imageUrl: image,
    imageAlt: product.name ?? 'Product image',
    quantity,
    inStock: product.inStock ?? product.stock !== 0,
    customization,
    customImageUrl,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [itemCount, setItemCount] = useState(0)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestVersion = useRef(0)

  const setCart = useCallback((cart: unknown) => {
    const data = adaptCart(cart)
    setItemCount(data.items.reduce((sum, item) => sum + item.quantity, 0))
    setCartData(data)
  }, [])

  const setGuestCart = useCallback((items: GuestCartItem[]) => {
    writeGuestCart(items)
    setItemCount(items.reduce((sum, item) => sum + item.quantity, 0))
    setCartData(toCartData(items))
  }, [])

  const syncGuestCart = useCallback(async () => {
    const guestItems = readGuestCart()
    if (!guestItems.length) return

    for (const item of guestItems) {
      const uploaded = await uploadGuestCustomization(item.customization)
      await api.cart.addItem({
        productId: item.productId,
        quantity: item.quantity,
        customization: uploaded.customization,
        customImageUrl: uploaded.customImageUrl ?? item.customImageUrl,
      })
    }
    writeGuestCart([])
  }, [])

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current

    if (!isAuthenticated) {
      setGuestCart(readGuestCart())
      return
    }

    setIsLoading(true)
    try {
      await syncGuestCart()
      const cart = await api.cart.getCart()
      if (version === requestVersion.current) setCart(cart)
    } catch {
      if (version === requestVersion.current) {
        setItemCount(0)
        setCartData(null)
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false)
    }
  }, [isAuthenticated, setCart, setGuestCart, syncGuestCart])

  useEffect(() => { refresh() }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, variantId?: string, customization?: Record<string, unknown>, customImageUrl?: string) => {
    if (!isAuthenticated) {
      const product = await api.products.getById(productId)
      const current = readGuestCart()
      const existingIndex = current.findIndex((item) => item.productId === productId && !item.customization)
      if (existingIndex >= 0 && !customization && !customImageUrl) {
        current[existingIndex] = {
          ...current[existingIndex],
          quantity: current[existingIndex].quantity + quantity,
        }
        setGuestCart(current)
        return
      }
      setGuestCart([...current, productToGuestItem(product, quantity, customization, customImageUrl)])
      return
    }

    const cart = await api.cart.addItem({ productId, quantity, variantId, customization, customImageUrl })
    ++requestVersion.current
    setCart(cart)
    setIsLoading(false)
  }, [isAuthenticated, setCart, setGuestCart])

  const updateItem = useCallback(async (cartItemId: string, quantity: number) => {
    if (!isAuthenticated && cartItemId.startsWith('guest-')) {
      const next = readGuestCart().map((item) => item.id === cartItemId ? { ...item, quantity } : item)
      setGuestCart(next)
      return
    }

    const cart = await api.cart.updateItem(cartItemId, { quantity })
    ++requestVersion.current
    setCart(cart)
    setIsLoading(false)
  }, [isAuthenticated, setCart, setGuestCart])

  const removeItem = useCallback(async (cartItemId: string) => {
    if (!isAuthenticated && cartItemId.startsWith('guest-')) {
      setGuestCart(readGuestCart().filter((item) => item.id !== cartItemId))
      return
    }

    const cart = await api.cart.removeItem(cartItemId)
    ++requestVersion.current
    setCart(cart)
    setIsLoading(false)
  }, [isAuthenticated, setCart, setGuestCart])

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setGuestCart([])
      return
    }

    await api.cart.clearCart()
    ++requestVersion.current
    setItemCount(0)
    setCartData({ items: [], charges: { shippingInr: 0, taxInr: 0, discountInr: 0 } })
    setIsLoading(false)
  }, [isAuthenticated, setGuestCart])

  const value = useMemo<CartContextValue>(() => ({
    itemCount,
    cartData,
    isLoading,
    refresh,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  }), [itemCount, cartData, isLoading, refresh, addItem, updateItem, removeItem, clearCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}