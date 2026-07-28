import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { adaptProductListing } from '@/lib/adapters'
import { useCart } from '@/contexts/CartContext'
import ProductListingGrid from '@/components/product-listing/ProductListingGrid'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'
import type { ProductListingProduct } from '@/types/productListing'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [products, setProducts] = useState<ProductListingProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    api.products.searchProducts(query)
      .then((res: unknown) => {
        const raw = Array.isArray(res) ? res : (res && typeof res === 'object' && Array.isArray((res as Record<string, unknown>).data)) ? (res as Record<string, unknown>).data as unknown[] : []
        setProducts(raw.map(adaptProductListing))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <main className="pt-32 pb-24 px-6 max-w-container mx-auto">
        <h1 className="text-2xl font-semibold mb-2">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {!query && <p className="text-[#6B6B6B] text-sm mb-8">Use the search bar to find products.</p>}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 && query ? (
          <p className="text-[#6B6B6B] py-16 text-center">No products found for "{query}".</p>
        ) : (
          <ProductListingGrid
            products={products}
            onProductSelect={(id) => navigate(`/shop/${id}`)}
            onAddToCart={(id) => addItem(id, 1)}
          />
        )}
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
