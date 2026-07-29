import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import Shipping from '@/components/cart/Shipping'
import { NAV_LINKS } from '@/constants/home'
import Navbar from '@/components/layout/Navbar'

export default function CartPage() {
  const navigate = useNavigate()
  const {
    cartData: contextCart,
    isLoading: contextLoading,
    updateItem,
    removeItem,
  } = useCart()
  // Use context data (already fetched when app loaded) — this avoids the
  // dual-fetch bug where useCartData silently failed while context succeeded.
  const cartData = contextCart
  const loading = contextLoading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <>
        <Navbar links={NAV_LINKS} />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
          <p className="text-[#6B6B6B]">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="text-sm text-[#800020] underline">
            Continue shopping
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <Shipping
        data={cartData}
        onCheckout={() => navigate('/checkout')}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
      />
    </>
  )
}
