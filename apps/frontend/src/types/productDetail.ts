export interface ProductImage {
  readonly id: string
  readonly url: string
  readonly alt: string
  readonly isVideo?: boolean
}

export interface ProductFeature {
  readonly id: string
  readonly text: string
}

export interface RatingBreakdown {
  readonly stars: 1 | 2 | 3 | 4 | 5
  readonly percentage: number
}

export interface ProductReviews {
  readonly average: number
  readonly count: number
  readonly breakdown: ReadonlyArray<RatingBreakdown>
}

export type ProductTabId = 'description' | 'specifications' | 'care'

export interface ProductTab {
  readonly id: ProductTabId
  readonly label: string
  readonly content: string
}

export interface RelatedProduct {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly priceInr: number
  readonly imageUrl: string
  readonly imageAlt: string
  readonly badge?: string
  readonly href?: string
}

export interface ProductCustomizationConfig {
  readonly numberOfImages: { readonly enabled: boolean; readonly count: number }
  readonly numberOfNames: { readonly enabled: boolean; readonly count: number }
  readonly date: { readonly enabled: boolean }
  readonly songName: { readonly enabled: boolean }
  readonly qrCodeImages: { readonly enabled: boolean; readonly count: number }
  readonly contactShop: { readonly enabled: boolean; readonly value: string }
  readonly startingFrom: { readonly enabled: boolean; readonly amount?: number }
}

export interface ProductData {
  readonly id: string
  readonly categorySlug: string
  readonly name: string
  readonly priceInr: number
  readonly inStock: boolean
  readonly description: string
  readonly images: ReadonlyArray<ProductImage>
  readonly features: ReadonlyArray<ProductFeature>
  readonly reviews: ProductReviews
  readonly tabs: ReadonlyArray<ProductTab>
  readonly relatedProducts: ReadonlyArray<RelatedProduct>
  readonly shippingNote: string
  readonly shippingDuration: string
  readonly customizationConfig: ProductCustomizationConfig
}
