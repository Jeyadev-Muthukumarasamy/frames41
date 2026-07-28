import type {
  ProductListingCategory,
  ProductListingProduct,
  ProductListingSortKey,
} from '../types/productListing'

export const PRODUCT_LISTING_CATEGORIES: ReadonlyArray<ProductListingCategory> = [
  { id: 'all', label: 'All' },
  { id: 'frames', label: 'Frames' },
  { id: 'decor', label: 'Decor' },
  { id: 'diy-kits', label: 'DIY Kits' },
]

export const PRODUCT_LISTING_SORT_OPTIONS: ReadonlyArray<{
  readonly value: ProductListingSortKey
  readonly label: string
}> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'rating-desc', label: 'Top Rated' },
]

export const PRODUCT_LISTING_PRODUCTS: ReadonlyArray<ProductListingProduct> = [
  {
    id: 'minimalist-a5-frame',
    slug: 'minimalist-a5-frame',
    categoryId: 'frames',
    name: 'Minimalist A5 Frame',
    priceInr: 499,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDyEs4JwPW4Y0kL3-xraT1X3-rQyjzSHGHrYZVbYK66jcX--a8EIrO-kjgjtyXeCOVh-On7hFjwo8zmcBT6el1s5wVabDxridAhyJmW02Yv4F9s4YhVYMAM-Q-mW8ZqfGkmtIppXae8V_p5uQmQPSMuHO8VmBzj_ryoLQY_nsgk5WtPQFQIHZyEMWlBKBpxE6y5haxpzDfAnO-CB9OXNRiJ6KqV63Mt0o-irJsUG7Mmq6nesqQA6GQCF9KJvOUQINo7O7fglCEqWtw',
    imageAlt: 'Minimalist A5 wooden photo frame on a desk',
    badge: 'New',
    description: 'Slim handcrafted wood profile for clean, modern spaces.',
    rating: 4.8,
    reviewCount: 128,
    inStock: true,
  },
  {
    id: 'world-map-triptych',
    slug: 'world-map-triptych',
    categoryId: 'decor',
    name: 'World Map Triptych',
    priceInr: 12000,
    description: 'Premium walnut and oak finish, hand-carved with precision.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAuFpGlZ3TT9D9x-i7sYqu_6Y7po7-C12PFcnaARkmkrKe0lp17ZUhPrm0yd6xXqxnxOpAX9bCQU3UMumb5YHrbZ_wfXFXGxOIUFZUiSu3LFJfqEiqsKhUHiPTp3akw_EiQQh4OXTG4ZuKN6xg971ngMv8xscKY39bulSNOdpOUwb_KxgJA15LXFwJfLo42UdLj-_MuRYBVmhpHnZwwV_IjGfd6_mZ6FNNrzFaqixA20fsOgZDa-WAzywrYrmQ7I_1o_g9lhlZ2h1Q',
    imageAlt: 'Three-panel world map wall art in walnut and oak finish',
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 74,
    inStock: true,
  },
  {
    id: 'mandala-coaster-set',
    slug: 'mandala-coaster-set',
    categoryId: 'decor',
    name: 'Mandala Coaster Set',
    priceInr: 799,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKK8ANnLPKkkYIQN2d-VmVf-PXupACGtPWTRQ31RitP47X4SUHNxTn_sfQESUda4HjrmMe7vQoGiDtkx0oe7iMFbGRthZ59To1sRqGKK3QMy_zd-HdH0SfHsG6Qemzsx1OS4slQSyNwCOoz-n7fLwmyxP9X_vBd-hP2swdiKQjOH_r_5i9mOdHedPCDafO2e-e3NUd50ZQhGmT2y_K1ZlOsIl1aGzrYq7Yg2mIDjdgYRtDfnTtk8f-c9YcATk5YAaXYesl7-C3RbzGgE5nVfSJL3B1YyiSJonpvMZKg',
    imageAlt: 'Set of mandala-patterned wooden coasters',
    badge: 'Popular',
    description: 'A warm tabletop accent with detailed mandala engraving.',
    rating: 4.7,
    reviewCount: 91,
    inStock: true,
  },
  {
    id: 'craft-starter-kit',
    slug: 'craft-starter-kit',
    categoryId: 'diy-kits',
    name: 'Craft Starter Kit',
    priceInr: 1499,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKfypEjXR8s3Qbg0ajcT_-dj6tK6Mv3QXtJjvq_0AOhmm8qoGiDtkx0oe7iMFbGRthZ59To1sRqGKK3QMy_zd-HdH0SfHsG6Qemzsx1OS4slQSyNwCOoz-n7fLwmyxP9X_vBd-hP2swdiKQjOH_r_5i9mOdHedPCDafO2e-e3NUd50ZQhGmT2y_K1ZlOsIl1aGzrYq7Yg2mIDjdgYRtDfnTtk8f-c9YcATk5YAaXYesl7-C3RbzGgE5nVfSJL3B1YyiSJonpvMZKg',
    imageAlt: 'DIY craft kit with materials and tools laid out',
    description: 'Everything needed to finish a small wood decor piece.',
    rating: 4.6,
    reviewCount: 43,
    inStock: false,
  },
]
