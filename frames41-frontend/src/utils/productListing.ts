import type {
  ProductListingProduct,
  ProductListingSortKey,
} from '@/types/productListing'

const MAX_SEARCH_LENGTH = 80

export function normalizeSearchQuery(value: string): string {
  return value.trim().slice(0, MAX_SEARCH_LENGTH).toLocaleLowerCase()
}

export function getProductHref(productSlug: string): string {
  return `/shop/${encodeURIComponent(productSlug)}`
}

export function filterProducts(
  products: ReadonlyArray<ProductListingProduct>,
  categoryId: string,
  searchQuery: string,
): ReadonlyArray<ProductListingProduct> {
  const normalizedQuery = normalizeSearchQuery(searchQuery)

  return products.filter((product) => {
    const matchesCategory = categoryId === 'all' || product.categoryId === categoryId
    const searchableText = `${product.name} ${product.description ?? ''}`.toLocaleLowerCase()
    const matchesSearch = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)

    return matchesCategory && matchesSearch
  })
}

export function sortProducts(
  products: ReadonlyArray<ProductListingProduct>,
  sortKey: ProductListingSortKey,
): ReadonlyArray<ProductListingProduct> {
  const sortedProducts = [...products]

  switch (sortKey) {
    case 'price-asc':
      return sortedProducts.sort((first, second) => first.priceInr - second.priceInr)
    case 'price-desc':
      return sortedProducts.sort((first, second) => second.priceInr - first.priceInr)
    case 'name-asc':
      return sortedProducts.sort((first, second) => first.name.localeCompare(second.name))
    case 'featured':
    default:
      return sortedProducts
  }
}
