import { useNavigate } from 'react-router-dom'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/contexts/CartContext'
import Wishlist from '@/components/wishlist/Wishlist'
import { WISHLIST_BANNER } from '@/constants/wishlist'

export default function WishlistPage() {
  const { items, loading, remove } = useWishlist()
  const { addItem } = useCart()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Wishlist
      items={items}
      banner={WISHLIST_BANNER}
      onRemoveItem={(id) => remove(id)}
      onAddToCart={(id) => {
        addItem(id, 1)
        navigate('/cart')
      }}
    />
  )
}
