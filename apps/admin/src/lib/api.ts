import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpiringSoon,
} from './token'
import type {
  DashboardStats,
  AnalyticsSummary,
  TopProduct,
  Period,
  AdminOrderListItem,
  AdminOrderDetail,
  AdminCustomerListItem,
  AdminCustomerDetail,
  AdminRefundListItem,
  RefundStatus,
  AdminProductListItem,
  AdminProductDetail,
  ProductFormData,
  AdminCategory,
  CategoryFormData,
  AdminBanner,
  BannerFormData,
  BannerType,
  AdminPendingReview,
  PaginatedMeta,
  OrderStatus,
  AdminCoupon,
  CouponFormData,
} from '@/types/admin'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const plainAxios = axios.create({ baseURL: API_BASE })

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []
let rejectQueue: Array<(err: unknown) => void> = []

const inFlightGets = new Map<string, Promise<unknown>>()
const getCache = new Map<string, { data: unknown; at: number }>()

function dedupeGet<T>(key: string, request: () => Promise<T>): Promise<T> {
  const existing = inFlightGets.get(key)
  if (existing) return existing as Promise<T>
  const promise = request().finally(() => inFlightGets.delete(key))
  inFlightGets.set(key, promise)
  return promise
}

function cachedGet<T>(key: string, request: () => Promise<T>, ttlMs: number): Promise<T> {
  return dedupeGet(key, () => {
    const cached = getCache.get(key)
    if (cached && Date.now() - cached.at < ttlMs) {
      return Promise.resolve(cached.data as T)
    }
    return request().then((data) => {
      getCache.set(key, { data, at: Date.now() })
      return data
    })
  })
}

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
  rejectQueue = []
}

function rejectAll(err: unknown) {
  rejectQueue.forEach((cb) => cb(err))
  refreshQueue = []
  rejectQueue = []
}

instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    if (isTokenExpiringSoon()) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const res = await plainAxios.post('/auth/refresh', { refreshToken })
          const payload = res.data?.data ?? res.data
          const accessToken = payload?.accessToken ?? payload?.tokens?.accessToken
          const newRefresh = payload?.refreshToken ?? payload?.tokens?.refreshToken ?? refreshToken
          const expiresIn = payload?.expiresIn ?? payload?.tokens?.expiresIn
          if (accessToken) {
            setTokens(accessToken, newRefresh, expiresIn)
            config.headers['Authorization'] = `Bearer ${accessToken}`
          }
          return config
        } catch {
          clearTokens()
        }
      }
    } else {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // Extract backend error message so callers see meaningful text
    const backendMessage = error.response?.data?.error?.message
    if (backendMessage && typeof backendMessage === 'string') {
      error.message = backendMessage
    }

    const original = error.config
    const status = error.response?.status
    const url = original?.url ?? 'unknown'

    console.error('[Frames41 API] Request failed', {
      method: original?.method,
      url,
      status,
      message: error.message,
      response: error.response?.data,
    })

    if (url.startsWith('/auth/') || status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token: string) => {
          original.headers['Authorization'] = `Bearer ${token}`
          resolve(instance(original))
        })
        rejectQueue.push(reject)
      })
    }

    isRefreshing = true
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const res = await plainAxios.post('/auth/refresh', { refreshToken })
      const payload = res.data?.data ?? res.data
      const accessToken = payload?.accessToken ?? payload?.tokens?.accessToken
      const newRefresh = payload?.refreshToken ?? payload?.tokens?.refreshToken ?? refreshToken
      const expiresIn = payload?.expiresIn ?? payload?.tokens?.expiresIn
      if (!accessToken) {
        throw new Error('No access token returned from refresh endpoint')
      }
      setTokens(accessToken, newRefresh, expiresIn)
      instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      drainQueue(accessToken)
      original.headers['Authorization'] = `Bearer ${accessToken}`
      return instance(original)
    } catch (refreshError) {
      rejectAll(refreshError)
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

function unwrap<T>(promise: Promise<AxiosResponse>): Promise<T> {
  return promise.then((res) => {
    if (res.data.success === false) throw new Error(res.data.error?.message ?? 'Request failed')
    return res.data.data as T
  })
}

function unwrapPaginated<T>(promise: Promise<AxiosResponse>): Promise<{ data: T[]; meta: PaginatedMeta }> {
  return promise.then((res) => {
    if (res.data.success === false) throw new Error(res.data.error?.message ?? 'Request failed')
    return { data: res.data.data as T[], meta: res.data.meta as PaginatedMeta }
  })
}

// Strip undefined and empty-string values so they are never sent as query params
function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''),
  ) as Partial<T>
}

type ProductApiShape = Omit<AdminProductDetail, 'imageUrls' | 'seoTitle' | 'seoDescription'> & {
  images?: Array<{ url: string }>
  category?: { name?: string }
  metaTitle?: string | null
  metaDescription?: string | null
}

function normalizeProduct(product: ProductApiShape): AdminProductDetail {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    discountedPrice: product.discountedPrice == null ? undefined : Number(product.discountedPrice),
    imageUrls: product.images?.map((image) => image.url) ?? [],
    categoryName: product.categoryName ?? product.category?.name,
    seoTitle: product.metaTitle ?? undefined,
    seoDescription: product.metaDescription ?? undefined,
    variants: (product.variants ?? []).map((variant) => ({
      ...variant,
      priceModifier: Number(variant.priceModifier),
    })),
    priceTiers: (product.priceTiers ?? []).map((tier) => ({
      ...tier,
      pricePerUnit: Number(tier.pricePerUnit),
    })),
  }
}

type AdminOrderApiShape = Omit<
  AdminOrderDetail,
  'address' | 'items' | 'statusHistory' | 'tracking' | 'subtotal' | 'discount' | 'shippingCharge' | 'total'
> & {
  address?: AdminOrderDetail['address']
  addressSnapshot?: AdminOrderDetail['address']
  subtotal: number | string
  discount: number | string
  shippingCharge: number | string
  total: number | string
  awbCode?: string | null
  trackingUrl?: string | null
  updatedAt?: string
  items?: Array<{
    id: string
    productName?: string
    productSnapshot?: {
      name?: string
      image?: string
      imageUrl?: string
      variantName?: string
    }
    variantName?: string
    quantity: number
    unitPrice: number | string
    total?: number | string
    totalPrice?: number | string
    imageUrl?: string
    customImageUrl?: string
    customization?: {
      wishes?: string
      text?: string
      customText?: string
      customImageUrl?: string
      imageUrl?: string
      imageUrls?: string[]
      names?: string[]
      date?: string
      songName?: string
      qrCodeImageUrls?: string[]
    } | null
  }>
  statusHistory?: Array<{
    status: OrderStatus
    note: string | null
    changedAt?: string
    createdAt?: string
    changedBy: string | null
  }>
  tracking?: AdminOrderDetail['tracking']
}

function normalizeAdminOrder(order: AdminOrderApiShape): AdminOrderDetail {
  return {
    ...order,
    address: order.address ?? order.addressSnapshot,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shippingCharge: Number(order.shippingCharge),
    total: Number(order.total),
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      productName: item.productName ?? item.productSnapshot?.name ?? 'Unknown product',
      variantName: item.variantName ?? item.productSnapshot?.variantName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total ?? item.totalPrice ?? 0),
      imageUrl: item.imageUrl ?? item.productSnapshot?.imageUrl ?? item.productSnapshot?.image,
      customText:
        item.customization?.wishes ??
        item.customization?.customText ??
        item.customization?.text,
      customImageUrl:
        item.customImageUrl ??
        item.customization?.customImageUrl ??
        item.customization?.imageUrl,
      customization: item.customization ?? undefined,
    })),
    statusHistory: (order.statusHistory ?? []).map((entry) => ({
      status: entry.status,
      note: entry.note,
      changedAt: entry.changedAt ?? entry.createdAt ?? order.placedAt,
      changedBy: entry.changedBy,
    })),
    tracking: order.tracking ?? (order.awbCode
      ? {
          awbCode: order.awbCode,
          trackingUrl: order.trackingUrl ?? undefined,
          updatedAt: order.updatedAt ?? order.placedAt,
        }
      : undefined),
  }
}

function toProductPayload(data: Partial<ProductFormData>) {
  const { seoTitle, seoDescription, variants, priceTiers, ...rest } = data
  delete (rest as Record<string, unknown>).imageUrls
  return {
    ...rest,
    ...(seoTitle !== undefined ? { metaTitle: seoTitle } : {}),
    ...(seoDescription !== undefined ? { metaDescription: seoDescription } : {}),
    ...(variants ? {
      variants: variants.map(({ imageUrl: _imageUrl, ...variant }) => variant),
    } : {}),
    ...(priceTiers ? {
      priceTiers: priceTiers.map(({ maxQty: _maxQty, ...tier }) => tier),
    } : {}),
  }
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      unwrap<{ accessToken: string; refreshToken: string; expiresIn: number }>(
        instance.post('/auth/dashboard-login', { email, password }),
      ),
    logout: (refreshToken: string) =>
      unwrap<{ message: string }>(instance.post('/auth/logout', { refreshToken })),
  },

  users: {
    getProfile: () => unwrap<{ id: string; email: string; name: string | null; phone: string | null; role: string }>(
      instance.get('/users/me'),
    ),
  },

  admin: {
    // ── Dashboard ────────────────────────────────────────────────────────────
    getDashboard: (period: Period, startDate?: string, endDate?: string, limit = 10) =>
      unwrap<{ stats: DashboardStats; analytics: AnalyticsSummary; topProducts: TopProduct[] }>(
        instance.get('/admin/dashboard', {
          params: stripEmpty({ period, startDate, endDate, limit }),
        }),
      ),

    getDashboardStats: () =>
      unwrap<DashboardStats>(instance.get('/admin/dashboard/stats')),

    getAnalytics: (period: Period, startDate?: string, endDate?: string) =>
      unwrap<AnalyticsSummary>(
        instance.get('/admin/dashboard/analytics', {
          params: stripEmpty({ period, startDate, endDate }),
        }),
      ),

    getTopProducts: (limit = 10, startDate?: string, endDate?: string) =>
      unwrap<TopProduct[]>(
        instance.get('/admin/dashboard/top-products', {
          params: stripEmpty({ limit, startDate, endDate }),
        }),
      ),

    // ── Orders ───────────────────────────────────────────────────────────────
    getOrders: (params: {
      page?: number
      limit?: number
      status?: OrderStatus
      search?: string
      startDate?: string
      endDate?: string
    }) => unwrapPaginated<AdminOrderListItem>(
      instance.get('/admin/orders', { params: stripEmpty(params as Record<string, unknown>) }),
    ),

    getOrderById: (id: string) =>
      unwrap<AdminOrderApiShape>(instance.get(`/admin/orders/${id}`)).then(normalizeAdminOrder),

    updateOrderStatus: (id: string, status: OrderStatus, note?: string) =>
      unwrap<AdminOrderDetail>(
        instance.patch(`/admin/orders/${id}/status`, { status, note }),
      ),

    addTracking: (id: string, awbCode: string, trackingUrl?: string) =>
      unwrap<AdminOrderDetail>(
        instance.post(`/admin/orders/${id}/tracking`, { awbCode, trackingUrl }),
      ),

    // ── Customers ────────────────────────────────────────────────────────────
    getCustomers: (params: { page?: number; limit?: number; search?: string }) =>
      unwrapPaginated<AdminCustomerListItem>(instance.get('/admin/customers', { params: stripEmpty(params as Record<string, unknown>) })),

    getCustomerById: (id: string) =>
      unwrap<AdminCustomerDetail>(instance.get(`/admin/customers/${id}`)),

    // ── Refunds ──────────────────────────────────────────────────────────────
    getRefunds: (params: { page?: number; limit?: number; status?: RefundStatus }) =>
      unwrapPaginated<AdminRefundListItem>(instance.get('/admin/refunds', { params })),

    processRefund: (id: string, status: RefundStatus, adminNote?: string) =>
      unwrap<AdminRefundListItem>(
        instance.patch(`/admin/refunds/${id}`, { status, adminNote }),
      ),

    // ── Products ─────────────────────────────────────────────────────────────
    getProducts: (params: {
      page?: number
      limit?: number
      search?: string
      categoryId?: string
      isActive?: boolean
      lowStock?: boolean
    }) => unwrapPaginated<AdminProductListItem>(instance.get('/products', { params })),

    getProductById: (id: string) =>
      unwrap<ProductApiShape>(instance.get(`/products/${id}`)).then(normalizeProduct),

    createProduct: (data: ProductFormData) =>
      unwrap<ProductApiShape>(instance.post('/products', toProductPayload(data))).then(normalizeProduct),

    updateProduct: (id: string, data: Partial<ProductFormData>) =>
      unwrap<ProductApiShape>(instance.patch(`/products/${id}`, toProductPayload(data))).then(normalizeProduct),

    deleteProduct: (id: string) =>
      unwrap<{ message: string }>(instance.delete(`/products/${id}`)),

    // ── Categories ───────────────────────────────────────────────────────────
    getCategoryTree: (includeInactive = true) =>
      cachedGet(`admin:categories:tree:${includeInactive}`, () =>
        unwrap<AdminCategory[]>(
          instance.get('/categories/tree', { params: { includeInactive } }),
        ), 120_000),

    createCategory: (data: CategoryFormData) =>
      unwrap<AdminCategory>(instance.post('/categories', data)),

    updateCategory: (id: string, data: Partial<CategoryFormData>) =>
      unwrap<AdminCategory>(instance.patch(`/categories/${id}`, data)),

    deleteCategory: (id: string) =>
      unwrap<{ message: string }>(instance.delete(`/categories/${id}`)),

    // ── Banners ──────────────────────────────────────────────────────────────
    getBanners: (type?: BannerType, includeInactive = true) =>
      unwrap<AdminBanner[]>(
        instance.get('/banners', { params: { type, includeInactive } }),
      ),

    createBanner: (data: BannerFormData) =>
      unwrap<AdminBanner>(instance.post('/banners', data)),

    updateBanner: (id: string, data: Partial<BannerFormData>) =>
      unwrap<AdminBanner>(instance.patch(`/banners/${id}`, data)),

    deleteBanner: (id: string) =>
      unwrap<{ message: string }>(instance.delete(`/banners/${id}`)),

    getCoupons: () =>
      unwrap<AdminCoupon[]>(instance.get('/admin/coupons')),

    createCoupon: (data: CouponFormData) =>
      unwrap<AdminCoupon>(instance.post('/admin/coupons', data)),

    updateCoupon: (id: string, data: Partial<CouponFormData>) =>
      unwrap<AdminCoupon>(instance.patch(`/admin/coupons/${id}`, data)),

    archiveCoupon: (id: string) =>
      unwrap<{ message: string }>(instance.delete(`/admin/coupons/${id}`)),

    // ── Reviews ──────────────────────────────────────────────────────────────
    getPendingReviews: (params: { page?: number; limit?: number }) =>
      unwrapPaginated<AdminPendingReview>(
        instance.get('/reviews/admin/pending', { params }),
      ),

    approveReview: (id: string) =>
      unwrap<{ message: string }>(instance.patch(`/reviews/${id}/approve`)),

    rejectReview: (id: string) =>
      unwrap<{ message: string }>(instance.delete(`/reviews/${id}/reject`)),

    // ── Upload ───────────────────────────────────────────────────────────────
    uploadImage: (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      return unwrap<{ url: string; urls?: string[] }>(
        instance.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      )
    },
    uploadImages: (files: File[]) => {
      if (files.length === 0) return Promise.resolve({ urls: [], url: '' })
      if (files.length === 1) {
        return api.admin.uploadImage(files[0]).then((res) => ({
          urls: res.urls ?? [res.url],
          url: res.url,
        }))
      }
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))
      return unwrap<{ urls: string[]; url: string }>(
        instance.post('/admin/upload/batch', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      )
    },
  },
}

export default instance
