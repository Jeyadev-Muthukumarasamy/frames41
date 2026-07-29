import { useCallback, useMemo, useReducer, useRef } from 'react'
import type { CartData, CartLineItem } from '../../types/shipping'
import CartItemList from './CartItemList'
import OrderSummaryPanel from './OrderSummaryPanel'

// ─── Reducer ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'INCREMENT'; id: string }
  | { type: 'DECREMENT'; id: string }
  | { type: 'SET_QUANTITY'; id: string; quantity: number }
  | { type: 'REMOVE'; id: string }

interface CartState {
  readonly quantities: Readonly<Record<string, number>>
  readonly removedIds: ReadonlySet<string>
}

function buildInitialState(items: ReadonlyArray<CartLineItem>): CartState {
  return {
    quantities: Object.fromEntries(items.map((item) => [item.id, item.quantity])),
    removedIds: new Set(),
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        quantities: {
          ...state.quantities,
          [action.id]: (state.quantities[action.id] ?? 1) + 1,
        },
      }
    case 'DECREMENT': {
      const current = state.quantities[action.id] ?? 1
      if (current <= 1) return state
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: current - 1 },
      }
    }
    case 'SET_QUANTITY':
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: action.quantity },
      }
    case 'REMOVE':
      return { ...state, removedIds: new Set([...state.removedIds, action.id]) }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface CartCheckoutPayload {
  readonly items: ReadonlyArray<{ id: string; quantity: number }>
  readonly promoCode: string
}

interface ShippingProps {
  data: CartData
  onCheckout?: (payload: CartCheckoutPayload) => void
  onUpdateItem?: (id: string, quantity: number) => Promise<void>
  onRemoveItem?: (id: string) => Promise<void>
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Shipping({
  data,
  onCheckout,
  onUpdateItem,
  onRemoveItem,
}: ShippingProps) {
  const [cart, dispatch] = useReducer(cartReducer, data.items, buildInitialState)
  const latestQuantities = useRef<Record<string, number>>(
    Object.fromEntries(data.items.map((item) => [item.id, item.quantity])),
  )
  const quantitySync = useRef(
    new Map<string, { confirmed: number; running: boolean }>(
      data.items.map((item) => [item.id, { confirmed: item.quantity, running: false }]),
    ),
  )

  const visibleItems = useMemo(
    () => data.items.filter((item) => !cart.removedIds.has(item.id)),
    [data.items, cart.removedIds],
  )

  const subtotalInr = useMemo(
    () =>
      visibleItems.reduce(
        (sum, item) => sum + item.priceInr * (cart.quantities[item.id] ?? item.quantity),
        0,
      ),
    [visibleItems, cart.quantities],
  )

  const syncQuantity = useCallback(async (id: string) => {
    if (!onUpdateItem) return

    let sync = quantitySync.current.get(id)
    if (!sync) {
      sync = { confirmed: latestQuantities.current[id] ?? 1, running: false }
      quantitySync.current.set(id, sync)
    }
    if (sync.running) return

    sync.running = true
    try {
      // Serialize writes per item and skip intermediate quantities accumulated
      // while a request is in flight. This keeps rapid clicks cheap and ordered.
      while (latestQuantities.current[id] !== sync.confirmed) {
        const target = latestQuantities.current[id]
        await onUpdateItem(id, target)
        sync.confirmed = target
      }
    } catch {
      latestQuantities.current[id] = sync.confirmed
      dispatch({ type: 'SET_QUANTITY', id, quantity: sync.confirmed })
    } finally {
      sync.running = false
    }
  }, [onUpdateItem])

  const handleIncrement = useCallback((id: string) => {
    const quantity = (latestQuantities.current[id] ?? 1) + 1
    latestQuantities.current[id] = quantity
    dispatch({ type: 'INCREMENT', id })
    void syncQuantity(id)
  }, [syncQuantity])

  const handleDecrement = useCallback((id: string) => {
    const current = latestQuantities.current[id] ?? 1
    if (current <= 1) return
    latestQuantities.current[id] = current - 1
    dispatch({ type: 'DECREMENT', id })
    void syncQuantity(id)
  }, [syncQuantity])

  const handleRemove = useCallback(async (id: string) => {
    await onRemoveItem?.(id)
    dispatch({ type: 'REMOVE', id })
  }, [onRemoveItem])

  const handleCheckout = useCallback(() => {
    onCheckout?.({
      items: visibleItems.map((item) => ({
        id: item.id,
        quantity: cart.quantities[item.id] ?? item.quantity,
      })),
      promoCode: '',
    })
  }, [onCheckout, visibleItems, cart.quantities])

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-xl">
      <header className="mb-xl">
        <h1 className="font-headline text-h1 text-on-background mb-sm">Your Creative Workshop</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Review your selection of handcrafted materials and kits before starting your next project.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-8">
          <CartItemList
            items={visibleItems}
            quantities={cart.quantities}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
          />
        </div>

        <OrderSummaryPanel
          charges={data.charges}
          subtotalInr={subtotalInr}
          onCheckout={handleCheckout}
        />
      </div>
    </main>
  )
}
