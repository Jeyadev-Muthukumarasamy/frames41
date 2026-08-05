import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useProductDetailData } from '@/hooks/useProductDetail'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/hooks/useWishlist'
import ProductDetail from '@/components/product-detail/ProductDetail'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Icon from '@/components/ui/Icon'
import { FOOTER_COLUMNS, NAV_LINKS, SOCIAL_LINKS } from '@/constants/home'

export default function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { product, loading, error } = useProductDetailData(slug)
  const { addItem } = useCart()
  const { toggle } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [slug])

  if (loading) {
    return (
      <>
        <Navbar links={NAV_LINKS} />
        <div className="bg-surface-container-low/40">
          <main className="mx-auto max-w-container px-4 py-8 sm:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="aspect-square w-full rounded-2xl bg-gray-200 animate-pulse" />
              <div className="flex flex-col gap-4">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="h-8 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-6 w-1/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-20 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse mt-4" />
              </div>
            </div>
          </main>
        </div>
        <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar links={NAV_LINKS} />
        <main className="flex min-h-[60vh] items-center justify-center bg-surface-container-low/40 px-4 py-16">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-background p-8 text-center shadow-sm">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Icon name="inventory_2" className="text-2xl text-primary" />
            </span>
            <h1 className="font-headline text-2xl font-bold text-on-background">Product not found</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {error ?? 'This product may have moved or is no longer available.'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
            >
              Back to shop
            </button>
          </div>
        </main>
        <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
      </>
    )
  }

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <div className="bg-surface-container-low/40">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-container items-center gap-2 px-4 pt-6 text-xs text-on-background/55 sm:px-6"
        >
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <Icon name="chevron_right" className="text-base" />
          <Link to="/shop" className="transition-colors hover:text-primary">Shop</Link>
          <Icon name="chevron_right" className="text-base" />
          <span className="truncate font-medium text-on-background" aria-current="page">
            {product.name}
          </span>
        </nav>
        <ProductDetail
          key={product.id}
          data={{ ...product, reviews: { ...product.reviews, breakdown: product.reviews.breakdown.map(b => ({ ...b, percentage: b.percentage ?? 0 })) } }}
          onAddToCart={({ productId, quantity, customization, customImageUrl }) =>
            addItem(productId, quantity, undefined, customization, customImageUrl)
          }
          onWishlistToggle={(productId) => toggle(productId)}
          onRelatedProductClick={(id) => navigate(`/shop/${id}`)}
          onViewAllRelated={() => navigate('/shop')}
          onWriteReview={() => navigate(`/reviews?product=${product.id}`)}
        />
      </div>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
