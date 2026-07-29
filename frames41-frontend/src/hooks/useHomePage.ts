import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { adaptProduct, adaptCategoryProductSection } from '@/lib/adapters'
import type { Product, CategoryProductSection, Banner } from '@/types/home'

type BannerResponse = Partial<Banner> & {
  image?: string
  mobileImage?: string
}

function normalizeBanner(banner: BannerResponse): Banner | null {
  const imageUrl = banner.imageUrl ?? banner.image
  if (!banner.id || !imageUrl) return null

  return {
    id: banner.id,
    type: banner.type ?? 'HEADER_SLIDER',
    title: banner.title,
    subtitle: banner.subtitle,
    imageUrl,
    mobileImageUrl: banner.mobileImageUrl ?? banner.mobileImage,
    link: banner.link,
    sortOrder: banner.sortOrder ?? 0,
    isActive: banner.isActive ?? true,
    startDate: banner.startDate,
    endDate: banner.endDate,
  }
}

function asProductList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const obj = value as { products?: unknown[]; data?: unknown[] }
    return obj.products ?? obj.data ?? []
  }
  return []
}

export function useHomePage() {
  const [categorySections, setCategorySections] = useState<CategoryProductSection[]>([])
  const [budgetProducts, setBudgetProducts] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [newCollections, setNewCollections] = useState<Product[]>([])
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    api.home.get()
      .then((home) => {
        if (cancelled) return

        const rawCategories = (Array.isArray(home.categories) ? home.categories : []) as any[]
        const bestList = asProductList(home.bestsellers)
        const newList = asProductList(home.newCollections)
        const budgetList = asProductList(home.budgetProducts)
        const allRawProducts = [...bestList, ...newList, ...budgetList]

        const sections = rawCategories
          .map((cat: any) => {
            const explicit = Array.isArray(cat.products) ? cat.products : []
            const matched = allRawProducts.filter((p: any) => p.categoryId === cat.id)
            const items = explicit.length > 0 ? explicit : (matched.length > 0 ? matched : allRawProducts.slice(0, 4))
            return {
              id: cat.id,
              slug: cat.slug ?? cat.id,
              title: cat.name,
              products: items.map(adaptProduct),
            }
          })
          .filter((section: CategoryProductSection) => section.products.length > 0)

        setCategorySections(sections)
        setBudgetProducts(budgetList.map(adaptProduct))
        setBestsellers(bestList.map(adaptProduct))
        setNewCollections(newList.map(adaptProduct).slice(0, 8))

        const homeBanners = home.heroBanners ?? (home.heroBanner ? [home.heroBanner] : [])
        setHeroBanners(
          (homeBanners as BannerResponse[])
            .map(normalizeBanner)
            .filter((banner): banner is Banner => banner?.type === 'HEADER_SLIDER')
            .sort((a, b) => a.sortOrder - b.sortOrder),
        )
      })
      .catch((err) => {
        if (!cancelled) console.error('[useHomePage] Home page data fetch failed:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { categorySections, budgetProducts, bestsellers, newCollections, heroBanners, loading }
}
