import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import HeroSection from '../components/home/HeroSection'
import CategoryProductsSection from '../components/home/CategoryProductsSection'
import BudgetSection from '../components/home/BudgetSection'
import NewCollectionsSection from '../components/home/NewCollectionsSection'
import BestsellersSection from '../components/home/BestsellersSection'
import CustomerReviewsSection from '../components/home/CustomerReviewsSection'
import NewsletterStrip from '../components/home/NewsletterStrip'
import Footer from '@/components/layout/Footer'
import ChatFab from '@/components/layout/ChatFab'
import ProductSectionShimmer from '../components/ui/ProductSectionShimmer'
import { useHomePage } from '../hooks/useHomePage'
import {
  NAV_LINKS,
  HERO,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
} from '../constants/home'

export default function HomePage() {
  const { categorySections, budgetProducts, bestsellers, newCollections, heroBanners, allProducts, loading } = useHomePage()

  return (
    <>
      <AnnouncementBar />
      <Navbar links={NAV_LINKS} />
      <main id="main-content">
        <HeroSection
          data={HERO}
          banners={heroBanners}
          products={allProducts}
          onExploreCta={() => {
            const el = document.getElementById('collections')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />

        {/* Mobile-only CTA between hero & collections */}
        <div className="sm:hidden px-4 mt-6 mb-6">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('collections')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            {HERO.primaryCta}
          </button>
        </div>

        {loading && !newCollections.length ? (
          <ProductSectionShimmer
            title="New Collections"
            eyebrow="Just In"
            count={4}
            layout="carousel"
          />
        ) : (
          <NewCollectionsSection products={newCollections} />
        )}
        {loading && !categorySections.length ? (
          <ProductSectionShimmer title="Categories" count={4} />
        ) : (
          <CategoryProductsSection sections={categorySections} />
        )}
        {loading && !budgetProducts.length ? (
          <ProductSectionShimmer
            title="Under ₹999"
            eyebrow="Value Picks"
            count={8}
            dark
          />
        ) : (
          <BudgetSection products={budgetProducts} priceLimit={999} />
        )}
        {loading && !bestsellers.length ? (
          <ProductSectionShimmer title="Bestsellers" count={3} layout="wide" />
        ) : (
          <BestsellersSection products={bestsellers} />
        )}
        <CustomerReviewsSection />
        <NewsletterStrip />
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
      <ChatFab onClick={() => {}} />
    </>
  )
}
