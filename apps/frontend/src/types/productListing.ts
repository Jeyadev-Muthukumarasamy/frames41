import type { Product } from './home'

export type ProductListingSortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest' | 'rating-desc'

export interface ProductListingCategory {
  readonly id: string
  readonly label: string
}

export interface ProductListingProduct extends Product {
  readonly categoryId: string
  readonly rating?: number
  readonly reviewCount?: number
  readonly inStock?: boolean
}

export interface ProductListingFilters {
  readonly categoryIds: string[]
  readonly minPrice: number | null
  readonly maxPrice: number | null
  readonly minRating: number | null
  readonly inStockOnly: boolean
  readonly searchQuery: string
}
