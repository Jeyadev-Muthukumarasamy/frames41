import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductListing } from '@/hooks/useProductListing'
import { useCart } from '@/contexts/CartContext'
import ProductListingGrid from '@/components/product-listing/ProductListingGrid'
import ProductFilters from '@/components/product-listing/ProductFilters'
import ActiveFilters from '@/components/product-listing/ActiveFilters'
import { PRODUCT_LISTING_SORT_OPTIONS } from '@/constants/productListing'
import { NAV_LINKS, FOOTER_COLUMNS, SOCIAL_LINKS } from '@/constants/home'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Icon from '@/components/ui/Icon'

export default function ProductListingPage() {
  const navigate = useNavigate()
  const {
    products,
    categories,
    loading,
    loadingMore,
    categoriesLoading,
    hasMore,
    loadMore,
    filters,
    updateFilters,
  } = useProductListing()
  const { addItem } = useCart()

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleClear = useCallback(() => {
    updateFilters({
      categoryIds: [],
      minPrice: null,
      maxPrice: null,
      minRating: null,
      inStockOnly: false,
      searchQuery: '',
      sort: 'featured',
    })
  }, [updateFilters])

  return (
    <>
      <Navbar links={NAV_LINKS} />

      <main className="mx-auto max-w-container px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-on-background">All Products</h1>
            <p className="mt-1 text-sm text-on-background/60">
              Explore our curated collection of handcrafted frames and decor.
            </p>
          </div>

          {/* Desktop Sort */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-xs font-bold uppercase tracking-widest text-on-background/60">
              Sort
            </span>
            <select
              value={filters.sort}
              onChange={(e) =>
                updateFilters({ sort: e.target.value as typeof filters.sort })
              }
              className="h-10 rounded-lg border border-on-background/15 bg-transparent px-3 text-sm font-bold text-on-background outline-none transition-colors focus:border-primary"
            >
              {PRODUCT_LISTING_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters bar */}
        <div className="mb-6">
          <ActiveFilters
            filters={filters}
            categories={categories}
            onChange={updateFilters}
            onClear={handleClear}
          />
        </div>

        {/* Mobile filter toggle + sort */}
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-on-background/15 px-4 py-2.5 text-sm font-bold text-on-background transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="tune" className="text-base" />
            Filters
            {(filters.categoryIds.length > 0 ||
              filters.minPrice !== null ||
              filters.maxPrice !== null ||
              filters.minRating !== null ||
              filters.inStockOnly ||
              filters.searchQuery.trim().length > 0) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {[
                  filters.categoryIds.length,
                  filters.minPrice !== null ? 1 : 0,
                  filters.maxPrice !== null ? 1 : 0,
                  filters.minRating !== null ? 1 : 0,
                  filters.inStockOnly ? 1 : 0,
                  filters.searchQuery.trim() ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          <select
            value={filters.sort}
            onChange={(e) =>
              updateFilters({ sort: e.target.value as typeof filters.sort })
            }
            className="h-10 rounded-lg border border-on-background/15 bg-transparent px-3 text-sm font-bold text-on-background outline-none transition-colors focus:border-primary"
          >
            {PRODUCT_LISTING_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content grid */}
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="sticky top-28 hidden h-fit w-64 shrink-0 lg:block">
            {categoriesLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-on-background/50">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading filters…
              </div>
            ) : (
              <ProductFilters
                categories={categories}
                filters={filters}
                onChange={updateFilters}
                onClear={handleClear}
                resultCount={products.length}
              />
            )}
          </aside>

          {/* Product Grid */}
          <section className="min-w-0 flex-1">
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#800020] border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Icon
                  name="search_off"
                  className="mb-4 text-4xl text-on-background/25"
                />
                <h3 className="text-lg font-semibold text-on-background">
                  No products found
                </h3>
                <p className="mt-1 max-w-xs text-sm text-on-background/60">
                  Try adjusting your filters or search query to find what you’re looking for.
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-5 rounded-full bg-on-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <ProductListingGrid
                  products={products}
                  onProductSelect={(id) => navigate(`/shop/${id}`)}
                  onAddToCart={(id) => addItem(id, 1)}
                />
                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="rounded-full border border-[#800020] px-8 py-3 text-sm font-medium text-[#800020] transition-colors hover:bg-[#800020] hover:text-white disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading…' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-on-background">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-1 text-on-background/60 hover:bg-on-background/5 hover:text-on-background"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <ProductFilters
              categories={categories}
              filters={filters}
              onChange={updateFilters}
              onClear={handleClear}
              resultCount={products.length}
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-full bg-on-background py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </>
  )
}
