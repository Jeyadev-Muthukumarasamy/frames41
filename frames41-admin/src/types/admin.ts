// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  timestamp?: string
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  lowStockProducts: number
  pendingReviews: number
  pendingRefunds: number
}

export type Period = 'today' | 'week' | 'month' | 'year' | 'custom'

export interface AnalyticsSummary {
  gmv: number
  aov: number
  totalOrders: number
  conversionRate: number
  period: string
}

export interface TopProduct {
  id: string
  name: string
  slug: string
  totalSold: number
  totalRevenue: number
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  userId: string
  userName: string | null
  userPhone: string
  status: OrderStatus
  subtotal: number
  discount: number
  shippingCharge: number
  total: number
  placedAt: string
  itemCount: number
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus
  note: string | null
  changedAt: string
  changedBy: string | null
}

export interface AdminOrderDetail {
  id: string
  orderNumber: string
  status: OrderStatus
  user: { id: string; name: string | null; phone: string; email: string | null }
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    label?: string
  }
  items: {
    id: string
    productName: string
    variantName?: string
    quantity: number
    unitPrice: number
    total: number
    imageUrl?: string
    customText?: string
    customImageUrl?: string
    customization?: Record<string, unknown>
  }[]
  subtotal: number
  discount: number
  shippingCharge: number
  total: number
  couponCode?: string
  tracking?: { awbCode: string; trackingUrl?: string; updatedAt: string }
  statusHistory: OrderStatusHistoryEntry[]
  placedAt: string
}

// ─── Customers ─────────────────────────────────────────────────────────────────

export interface AdminCustomerListItem {
  id: string
  name: string | null
  phone: string
  email: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface AdminCustomerDetail {
  id: string
  name: string | null
  phone: string
  email: string | null
  createdAt: string
  totalOrders: number
  totalSpent: number
  orders: {
    id: string
    orderNumber: string
    status: OrderStatus
    total: number
    placedAt: string
  }[]
  addresses: {
    id: string
    line1: string
    city: string
    state: string
    pincode: string
  }[]
}

// ─── Refunds ───────────────────────────────────────────────────────────────────

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AdminRefundListItem {
  id: string
  orderId: string
  orderNumber: string
  userId: string
  userName: string | null
  userPhone: string
  reason: string
  videoUrl: string | null
  status: RefundStatus
  requestedAt: string
}

// ─── Products ──────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id?: string
  name: string
  sku?: string
  priceModifier: number
  stock: number
  imageUrl?: string
}

export interface PriceTier {
  id?: string
  minQty: number
  maxQty?: number
  pricePerUnit: number
}

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  sku?: string
  basePrice: number
  discountedPrice?: number
  stock: number
  isActive: boolean
  isBestSeller: boolean
  isFeatured: boolean
  categoryName?: string
  imageUrls?: string[]
  specifications?: Record<string, string | number>
  careInstructions?: string
  customizationConfig?: ProductCustomizationConfig
}

export interface ProductCustomizationConfig {
  numberOfImages: { enabled: boolean; count: number }
  numberOfNames: { enabled: boolean; count: number }
  date: { enabled: boolean }
  songName: { enabled: boolean }
  qrCodeImages: { enabled: boolean; count: number }
  contactShop: { enabled: boolean; value: string }
  startingFrom: { enabled: boolean; amount?: number }
}

export interface AdminProductDetail extends AdminProductListItem {
  description?: string
  categoryId?: string
  variants: ProductVariant[]
  priceTiers: PriceTier[]
  seoTitle?: string
  seoDescription?: string
  customizationConfig: ProductCustomizationConfig
}

export interface ProductImageInput {
  url: string
  alt?: string
  sortOrder: number
  isPrimary: boolean
}

export interface ProductFormData {
  name: string
  slug: string
  sku: string
  description: string
  specifications: Record<string, string | number>
  careInstructions: string
  basePrice: number
  discountedPrice?: number
  stock: number
  categoryId: string
  isActive: boolean
  isBestSeller: boolean
  isFeatured: boolean
  imageUrls: string[]
  images?: ProductImageInput[]
  variants: Omit<ProductVariant, 'id'>[]
  priceTiers: Omit<PriceTier, 'id'>[]
  seoTitle?: string
  seoDescription?: string
  customizationConfig: ProductCustomizationConfig
}

// ─── Categories ────────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string | null
  sortOrder: number
  isActive: boolean
  children: AdminCategory[]
}

export interface CategoryFormData {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string | null
  sortOrder: number
  isActive: boolean
}

// ─── Banners ───────────────────────────────────────────────────────────────────

export type BannerType =
  | 'TOP_STRIP'
  | 'HEADER_SLIDER'
  | 'UNDER_999'
  | 'CATEGORY_BANNER'
  | 'PROMOTIONAL'

export const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  TOP_STRIP: 'Top Strip',
  HEADER_SLIDER: 'Header Slider',
  UNDER_999: 'Under ₹999',
  CATEGORY_BANNER: 'Category Banner',
  PROMOTIONAL: 'Promotional',
}

export interface AdminBanner {
  id: string
  type: BannerType
  title?: string
  subtitle?: string
  imageUrl: string
  mobileImageUrl?: string
  link?: string
  sortOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

export interface BannerFormData {
  type: BannerType
  title?: string
  subtitle?: string
  imageUrl: string
  mobileImageUrl?: string
  link?: string
  sortOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

export type CouponType = 'PERCENT' | 'FLAT' | 'FIRST_ORDER'

export interface AdminCoupon {
  id: string
  code: string
  type: CouponType
  value: number
  minOrderValue: number | null
  maxDiscount: number | null
  usageLimit: number | null
  perUserLimit: number | null
  redemptionCount: number
  validFrom: string
  validTo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CouponFormData {
  code: string
  type: CouponType
  value: number
  minOrderValue?: number
  maxDiscount?: number
  usageLimit?: number
  perUserLimit?: number
  validFrom: string
  validTo: string
  isActive: boolean
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export interface AdminPendingReview {
  id: string
  productId: string
  productName: string
  userId: string
  userName: string | null
  rating: number
  title?: string
  body: string
  images: string[]
  isVerified: boolean
  createdAt: string
}
