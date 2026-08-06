import type { Product, Category, CategoryProductSection } from '@/types/home'
import type { ProductData, ProductImage, RelatedProduct, ProductCustomizationConfig } from '@/types/productDetail'
import type { ProductListingProduct } from '@/types/productListing'
import type { CartLineItem, CartData, CartCharges } from '@/types/shipping'
import type { ShippingAddress, CheckoutLineItem, CheckoutTotals } from '@/types/checkout'
import type { ProfileUser, ProfileAddress } from '@/types/profile'
import type { WishlistItem } from '@/types/wishlist'
import type { ReviewItem, ReviewFormProduct } from '@/types/review'
import type { ReferralEntry, ReferralStats } from '@/types/refer'
import type { OrderDetails, OrderItem, OrderStep } from '@/types/order'
import type { TrackingStep, ShipmentEvent, OrderTrackingData, DeliveryInfo, TrackingStepStatus } from '@/types/ordertracking'
import type { TrackingOrderItem } from '@/types/ordertracking'
import { getOptimizedImageUrl } from '@/utils/image'

// ─── Backend response shapes (loose) ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any

// ─── Products ─────────────────────────────────────────────────────────────────
export function adaptProduct(p: Raw): Product {
  const price = Number(p.discountedPrice ?? p.basePrice ?? p.priceInr ?? 0)
  const originalPrice = Number(p.basePrice ?? p.originalPriceInr ?? 0)
  const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
  const rawUrl = firstImage?.url || firstImage?.src || p.imageUrl || p.image || p.url || p.category?.image || p.category?.imageUrl || ''

  let displayName = p.name || 'Custom Photo Frame'
  const catName = p.categoryName || p.category?.name
  if (catName && displayName.length <= 4 && !displayName.toLowerCase().includes(catName.toLowerCase())) {
    const cleanCat = catName.replace(/^\d+\s*/, '').trim()
    displayName = `${cleanCat} (${p.name})`
  }

  return {
    id: p.id,
    slug: p.slug ?? p.id,
    name: displayName,
    priceInr: price,
    originalPriceInr: originalPrice > price ? originalPrice : undefined,
    imageUrl: rawUrl,
    imageAlt: firstImage?.alt || displayName,
    badge: p.isBestSeller ? 'Bestseller' : p.isFeatured ? 'Featured' : undefined,
    description: p.shortDescription ?? p.description,
    hasOptions: true,
  }
}

export function adaptProductDetail(p: Raw): ProductData {
  const rawConfig = p.customizationConfig ?? {}
  const customizationConfig: ProductCustomizationConfig = {
    numberOfImages: {
      enabled: rawConfig.numberOfImages?.enabled ?? false,
      count: Math.max(1, Number(rawConfig.numberOfImages?.count ?? 1)),
    },
    numberOfNames: {
      enabled: rawConfig.numberOfNames?.enabled ?? false,
      count: Math.max(1, Number(rawConfig.numberOfNames?.count ?? 1)),
    },
    date: { enabled: rawConfig.date?.enabled ?? false },
    songName: { enabled: rawConfig.songName?.enabled ?? false },
    qrCodeImages: {
      enabled: rawConfig.qrCodeImages?.enabled ?? false,
      count: rawConfig.qrCodeImages?.count ?? 1,
    },
    contactShop: {
      enabled: rawConfig.contactShop?.enabled ?? false,
      value: rawConfig.contactShop?.value ?? '',
    },
    startingFrom: {
      enabled: rawConfig.startingFrom?.enabled ?? false,
      amount: rawConfig.startingFrom?.amount == null ? undefined : Number(rawConfig.startingFrom.amount),
    },
  }
  return {
    id: p.id,
    categorySlug: p.category?.slug ?? '',
    name: p.name,
    priceInr: Number(p.discountedPrice ?? p.basePrice),
    inStock: (p.stock ?? 0) > 0,
    description: p.description ?? '',
    images: (p.images ?? []).map((img: Raw): ProductImage => ({
      id: img.id,
      url: getOptimizedImageUrl(img.url),
      alt: img.alt ?? p.name,
      isVideo: false,
    })),
    features: Object.entries(p.specifications ?? {}).map(([key, val], i) => ({
      id: String(i),
      text: `${key}: ${val}`,
    })),
    reviews: {
      average: 0,
      count: 0,
      breakdown: [],
    },
    tabs: [
      { id: 'description', label: 'Description', content: p.description ?? '' },
      { id: 'specifications', label: 'Specifications', content: JSON.stringify(p.specifications ?? {}) },
      { id: 'care', label: 'Care', content: p.careInstructions ?? '' },
    ],
    relatedProducts: [],
    customizationConfig,
    shippingNote: 'Free shipping on orders above ₹999',
    shippingDuration: '3–7 business days',
  }
}

export function adaptProductListing(p: Raw): ProductListingProduct {
  return {
    ...adaptProduct(p),
    categoryId: p.categoryId ?? '',
    rating: undefined,
    reviewCount: undefined,
    inStock: (p.stock ?? 0) > 0,
  }
}

export function adaptRelatedProduct(p: Raw): RelatedProduct {
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    name: p.name,
    priceInr: Number(p.discountedPrice ?? p.basePrice),
    imageUrl: getOptimizedImageUrl(p.images?.[0]?.url ?? p.imageUrl ?? p.image ?? ''),
    imageAlt: p.images?.[0]?.alt ?? p.name,
    badge: p.isBestSeller ? 'Bestseller' : undefined,
    href: `/shop/${p.slug}`,
  }
}

// ─── Category ─────────────────────────────────────────────────────────────────
export function adaptCategory(c: Raw, index = 0): Category {
  const rawImage = c.imageUrl ?? c.image ?? c.products?.[0]?.images?.[0]?.url ?? c.products?.[0]?.imageUrl ?? 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80'
  return {
    id: c.id,
    title: c.name,
    description: c.description ?? undefined,
    cta: 'Shop Now',
    imageUrl: getOptimizedImageUrl(rawImage),
    imageAlt: c.name,
    span: index % 3 === 0 ? 'wide' : 'narrow',
  }
}

export function adaptCategoryProductSection(c: Raw): CategoryProductSection {
  return {
    id: c.id,
    slug: c.slug ?? c.id,
    title: c.name,
    products: (c.products ?? []).map(adaptProduct),
  }
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export function adaptCartItem(item: Raw): CartLineItem {
  const customImg =
    item.customImageUrl ||
    item.customization?.customImageUrl ||
    (Array.isArray(item.customization?.imageUrls) ? item.customization.imageUrls[0] : undefined)
  return {
    id: item.id,
    name: item.productName ?? item.product?.name ?? '',
    variant: item.variantName ?? '',
    priceInr: Number(item.unitPrice),
    imageUrl: customImg || item.productImage || item.product?.images?.[0]?.url || '',
    imageAlt: item.productName ?? item.product?.name ?? '',
    quantity: item.quantity,
    inStock: true,
  }
}

export function adaptCart(cart: Raw): CartData {
  const charges: CartCharges = {
    shippingInr: Number(cart.shippingCharge ?? 0),
    taxInr: 0,
    discountInr: Number(cart.couponDiscount ?? 0),
  }
  return {
    items: (cart.items ?? []).map(adaptCartItem),
    charges,
  }
}

// ─── Address ─────────────────────────────────────────────────────────────────
export function adaptAddress(a: Raw): ShippingAddress {
  return {
    id: a.id,
    label: a.isDefault ? 'Default' : 'Saved',
    fullName: a.name ?? '',
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    zip: a.pincode,
    country: 'India',
  }
}

export function adaptProfileAddress(a: Raw): ProfileAddress {
  return {
    id: a.id,
    label: a.isDefault ? 'Default' : 'Saved',
    fullName: a.name ?? '',
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    zip: a.pincode,
    country: 'India',
    isDefault: a.isDefault ?? false,
  }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
export function adaptCheckoutLineItem(item: Raw): CheckoutLineItem {
  const customImg =
    item.customImageUrl ||
    item.customization?.customImageUrl ||
    (Array.isArray(item.customization?.imageUrls) ? item.customization.imageUrls[0] : undefined)
  return {
    id: item.id,
    name: item.productName ?? '',
    variant: item.variantName ?? '',
    priceInr: Number(item.unitPrice),
    imageUrl: customImg || item.productImage || item.product?.images?.[0]?.url || '',
    imageAlt: item.product?.images?.[0]?.alt ?? item.productName ?? '',
  }
}

export function adaptCheckoutTotals(cart: Raw): CheckoutTotals {
  const subtotalInr = Number(cart.subtotal ?? 0)
  const shippingInr = Number(cart.shippingCharge ?? 0)
  const discountInr = Number(cart.couponDiscount ?? 0)
  return {
    subtotalInr,
    taxInr: 0,
    shippingInr,
    discountInr,
    totalInr: Number(cart.total ?? subtotalInr + shippingInr - discountInr),
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export function adaptProfileUser(u: Raw): ProfileUser {
  return {
    legalName: u.name ?? '',
    email: u.email ?? '',
    phone: u.phone ?? '',
    timezone: 'Asia/Kolkata',
  }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export function adaptWishlistItem(w: Raw): WishlistItem {
  const p = w.product ?? w
  return {
    id: p.id,
    name: p.name,
    material: p.shortDescription ?? '',
    priceInr: Number(p.discountedPrice ?? p.basePrice),
    imageUrl: p.images?.[0]?.url ?? '',
    imageAlt: p.images?.[0]?.alt ?? p.name,
  }
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export function adaptReviewItem(r: Raw): ReviewItem {
  return {
    id: r.id,
    productName: r.product?.name ?? '',
    productImage: r.product?.images?.[0]?.url ?? '',
    productImageAlt: r.product?.images?.[0]?.alt ?? '',
    rating: r.rating,
    reviewText: r.body,
    displayDate: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    isoDate: r.createdAt,
    status: r.isApproved ? 'approved' : 'pending',
  }
}

export function adaptReviewFormProduct(p: Raw): ReviewFormProduct {
  return { id: p.id, name: p.name }
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export function adaptReferralEntry(r: Raw): ReferralEntry {
  return {
    id: r.id,
    name: r.user?.name ?? r.userId ?? 'User',
    date: new Date(r.redeemedAt).toLocaleDateString('en-IN'),
    status: r.orderId ? 'completed' : 'pending',
    rewardInr: Number(r.commissionAmount ?? 0),
  }
}

export function adaptReferralStats(_code: Raw, history: Raw[]): ReferralStats {
  const completed = history.filter((r: Raw) => r.orderId)
  return {
    totalEarnedInr: completed.reduce((sum: number, r: Raw) => sum + Number(r.commissionAmount ?? 0), 0),
    successfulReferrals: completed.length,
    pendingRewardsInr: history
      .filter((r: Raw) => !r.orderId)
      .reduce((sum: number, r: Raw) => sum + Number(r.commissionAmount ?? 0), 0),
  }
}

// ─── Order Confirm ────────────────────────────────────────────────────────────
export function adaptOrderItem(item: Raw): OrderItem {
  const snap = item.productSnapshot ?? {}
  const imgUrl =
    item.customImageUrl ||
    item.customization?.customImageUrl ||
    (Array.isArray(item.customization?.imageUrls) ? item.customization.imageUrls[0] : undefined) ||
    snap.image ||
    snap.imageUrl ||
    snap.images?.[0]?.url ||
    item.product?.images?.[0]?.url ||
    ''
  return {
    id: item.id,
    name: snap.name ?? item.productId,
    description: snap.shortDescription ?? '',
    priceInr: Number(item.unitPrice),
    quantity: item.quantity,
    imageUrl: imgUrl,
    imageAlt: snap.imageAlt ?? snap.images?.[0]?.alt ?? snap.name ?? '',
  }
}

export function adaptOrderDetails(order: Raw): OrderDetails {
  const steps: OrderStep[] = [
    { id: '1', label: 'Order Placed', description: 'Your order has been received', status: 'complete' },
    { id: '2', label: 'Processing', description: 'Your order is being prepared', status: orderStepStatus(order.status, 'PROCESSING') },
    { id: '3', label: 'Shipped', description: 'Your order is on its way', status: orderStepStatus(order.status, 'SHIPPED') },
    { id: '4', label: 'Delivered', description: 'Your order has been delivered', status: orderStepStatus(order.status, 'DELIVERED') },
  ]
  return {
    orderNumber: order.orderNumber,
    estimatedDelivery: order.shippedAt
      ? '3–5 business days from shipment'
      : '5–7 business days',
    shippingMethod: 'Standard Delivery',
    subtotalInr: Number(order.subtotal),
    shippingCostInr: Number(order.shippingCharge) === 0 ? 'complimentary' : Number(order.shippingCharge),
    totalInr: Number(order.total),
    codDueAmountInr: Number(order.codDueAmount ?? 0),
    items: (order.items ?? []).map(adaptOrderItem),
    // @ts-expect-error steps attached for OrderConfirm page
    steps,
  }
}

// ─── Order Tracking ───────────────────────────────────────────────────────────
const STATUS_ORDER = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function orderStepStatus(current: string, target: string): 'complete' | 'active' | 'pending' {
  const ci = STATUS_ORDER.indexOf(current)
  const ti = STATUS_ORDER.indexOf(target)
  if (ci > ti) return 'complete'
  if (ci === ti) return 'active'
  return 'pending'
}

export function adaptOrderTracking(order: Raw): OrderTrackingData {
  const steps: TrackingStep[] = [
    { id: '1', label: 'Order Placed', icon: 'receipt', status: 'complete', timestamp: order.placedAt ?? '' },
    { id: '2', label: 'Processing', icon: 'inventory', status: orderStepStatus(order.status, 'PROCESSING') as TrackingStepStatus, timestamp: '' },
    { id: '3', label: 'Shipped', icon: 'local_shipping', status: orderStepStatus(order.status, 'SHIPPED') as TrackingStepStatus, timestamp: order.shippedAt ?? '' },
    { id: '4', label: 'Delivered', icon: 'home', status: orderStepStatus(order.status, 'DELIVERED') as TrackingStepStatus, timestamp: order.deliveredAt ?? '' },
  ]

  const events: ShipmentEvent[] = (order.statusHistory ?? []).map((h: Raw, i: number) => ({
    id: h.id ?? String(i),
    title: h.status,
    location: '',
    timestamp: new Date(h.createdAt).toLocaleString('en-IN'),
    isLatest: i === 0,
  }))

  const snap = order.addressSnapshot ?? {}
  const delivery: DeliveryInfo = {
    address: {
      recipientName: snap.name ?? '',
      streetLine1: snap.line1 ?? '',
      streetLine2: [snap.line2, snap.city].filter(Boolean).join(', '),
      stateAndCountry: `${snap.state ?? ''}, India`,
    },
    contact: { email: '', phone: snap.phone ?? '' },
    estimatedDelivery: '3–5 business days',
  }

  const items: TrackingOrderItem[] = (order.items ?? []).map((item: Raw) => {
    const snap = item.productSnapshot ?? {}
    const imgUrl =
      item.customImageUrl ||
      item.customization?.customImageUrl ||
      (Array.isArray(item.customization?.imageUrls) ? item.customization.imageUrls[0] : undefined) ||
      snap.image ||
      snap.imageUrl ||
      snap.images?.[0]?.url ||
      item.product?.images?.[0]?.url ||
      ''
    return {
      id: item.id,
      name: snap.name ?? '',
      subtitle: snap.shortDescription ?? '',
      size: item.customization?.size ?? '',
      quantity: item.quantity,
      priceInr: Number(item.unitPrice),
      imageUrl: imgUrl,
      imageAlt: snap.imageAlt ?? snap.images?.[0]?.alt ?? snap.name ?? '',
    }
  })

  return {
    orderNumber: order.orderNumber,
    awbNumber: order.awbCode ?? '—',
    steps,
    items,
    shipmentEvents: events,
    delivery,
    totals: {
      subtotalInr: Number(order.subtotal),
      shippingInr: Number(order.shippingCharge),
      taxInr: 0,
      totalInr: Number(order.total),
    },
  }
}
