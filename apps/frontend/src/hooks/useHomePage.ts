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

export function useHomePage() {
  const [categorySections, setCategorySections] = useState<CategoryProductSection[]>([])
  const [budgetProducts, setBudgetProducts] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [newCollections, setNewCollections] = useState<Product[]>([])
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.home.get(),
      api.banners.getByType('HEADER_SLIDER'),
    ])
      .then(async ([homeResult, bannersResult]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const home: any = homeResult.status === 'fulfilled' ? homeResult.value : {}
        const cats = home.categories ?? []
        const budget = home.budgetProducts ?? []
        const best = home.bestsellers ?? []
        const recent = home.newCollections ?? []
        const embeddedSections = (cats ?? []).map(adaptCategoryProductSection)
        const categoriesMissingProducts = embeddedSections.filter(
          (section: CategoryProductSection) => section.products.length === 0,
        )
        let resolvedSections: CategoryProductSection[]

        if (categoriesMissingProducts.length > 0) {
          const productResults = await Promise.allSettled(
            categoriesMissingProducts.map((section: CategoryProductSection) =>
              api.products.getProducts({
                categoryId: section.id,
                limit: 4,
                sort: 'featured',
              }),
            ),
          )

          const fallbackProducts = new Map<string, Product[]>()
          productResults.forEach((result, index) => {
            if (result.status !== 'fulfilled') return
            const response = result.value as {
              products?: unknown[]
              data?: unknown[]
            } | unknown[]
            const rawProducts = Array.isArray(response)
              ? response
              : response.products ?? response.data ?? []
            fallbackProducts.set(
              categoriesMissingProducts[index].id,
              rawProducts.map(adaptProduct),
            )
          })

          resolvedSections = embeddedSections
            .map((section: CategoryProductSection) =>
              section.products.length > 0
                ? section
                : {
                    ...section,
                    products: fallbackProducts.get(section.id) ?? [],
                  },
            )
            .filter((section: CategoryProductSection) => section.products.length > 0)
        } else {
          resolvedSections = embeddedSections.filter(
            (section: CategoryProductSection) => section.products.length > 0,
          )
        }

        setCategorySections(resolvedSections)
        setBudgetProducts((budget?.products ?? budget?.data ?? budget ?? []).map(adaptProduct))
        setBestsellers((best?.products ?? best?.data ?? best ?? []).map(adaptProduct))
        setNewCollections((recent?.products ?? recent?.data ?? recent ?? []).map(adaptProduct).slice(0, 8))

        const homeBanners = home.heroBanners ?? (home.heroBanner ? [home.heroBanner] : [])
        const rawBanners = bannersResult.status === 'fulfilled'
          ? bannersResult.value
          : homeBanners
        const normalizedBanners = (rawBanners as BannerResponse[])
          .map(normalizeBanner)
          .filter((banner): banner is Banner => banner?.type === 'HEADER_SLIDER')
          .sort((a, b) => a.sortOrder - b.sortOrder)
        setHeroBanners(normalizedBanners)

        if (homeResult.status === 'rejected') {
          console.error('[useHomePage] Home page data fetch failed:', homeResult.reason)
        }
        if (bannersResult.status === 'rejected') {
          console.error('[useHomePage] Header banners fetch failed:', bannersResult.reason)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return { categorySections, budgetProducts, bestsellers, newCollections, heroBanners, loading }
}
