import axios from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpiringSoon,
} from "./token";

// Use relative base so Vite dev-server proxy ("/api" → backend) works
const API_BASE = "/api/v1";

// ─── Plain instance used only for token refresh (avoids interceptor loops) ───
const plainAxios = axios.create({ baseURL: API_BASE });

// ─── Main instance ─────────────────────────────────────────────────────────────
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ─── Refresh queue to prevent concurrent refresh races ─────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];
let rejectQueue: Array<(err: unknown) => void> = [];
let proactiveRefresh: Promise<string> | null = null;
const inFlightGets = new Map<string, Promise<unknown>>();

function dedupeGet<T>(key: string, request: () => Promise<T>): Promise<T> {
  const existing = inFlightGets.get(key);
  if (existing) return existing as Promise<T>;
  const promise = request().finally(() => inFlightGets.delete(key));
  inFlightGets.set(key, promise);
  return promise;
}

function refreshAccessToken(): Promise<string> {
  if (proactiveRefresh) return proactiveRefresh;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error("Refresh token unavailable"));

  proactiveRefresh = plainAxios
    .post("/auth/refresh", { refreshToken })
    .then((res) => {
      const {
        accessToken,
        refreshToken: newRefresh,
        expiresIn,
      } = res.data.data;
      setTokens(accessToken, newRefresh, expiresIn);
      return accessToken as string;
    })
    .finally(() => {
      proactiveRefresh = null;
    });
  return proactiveRefresh;
}

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
  rejectQueue = [];
}

function rejectAll(err: unknown) {
  rejectQueue.forEach((cb) => cb(err));
  refreshQueue = [];
  rejectQueue = [];
}

// ─── Request interceptor ───────────────────────────────────────────────────────
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      if (isTokenExpiringSoon()) {
        try {
          const accessToken = await refreshAccessToken();
          config.headers["Authorization"] = `Bearer ${accessToken}`;
          return config;
        } catch {
          clearTokens();
        }
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
);

// ─── Response interceptor (handle 401 with refresh queue) ─────────────────────
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token: string) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          resolve(instance(original));
        });
        rejectQueue.push(reject);
      });
    }

    isRefreshing = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    try {
      const res = await plainAxios.post("/auth/refresh", { refreshToken });
      const {
        accessToken,
        refreshToken: newRefresh,
        expiresIn,
      } = res.data.data;
      setTokens(accessToken, newRefresh, expiresIn);
      instance.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`;
      drainQueue(accessToken);
      original.headers["Authorization"] = `Bearer ${accessToken}`;
      return instance(original);
    } catch (refreshError) {
      rejectAll(refreshError);
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Response unwrapper ────────────────────────────────────────────────────────
function unwrap<T>(promise: Promise<AxiosResponse>): Promise<T> {
  return promise.then((res) => {
    if (res.data.success === false)
      throw new Error(res.data.error?.message ?? "Request failed");
    return res.data.data as T;
  });
}

interface PaginatedResponse<T> {
  data: T[];
  products: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface PaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  orderNumber: string;
}

function unwrapPaginated<T>(promise: Promise<AxiosResponse>): Promise<PaginatedResponse<T>> {
  return promise.then((res) => {
    if (res.data.success === false)
      throw new Error(res.data.error?.message ?? "Request failed");
    const data = res.data.data as T[];
    const pagination = res.data.meta?.pagination;
    return {
      data,
      products: data,
      nextCursor: pagination?.nextCursor ?? null,
      hasMore: pagination?.hasMore ?? false,
    };
  });
}

// ─── API namespace ─────────────────────────────────────────────────────────────
export const api = {
  home: {
    get: () => unwrap<Record<string, unknown>>(instance.get("/home")),
  },
  auth: {
    phoneLogin: (phone: string) =>
      unwrap<{ accessToken: string; refreshToken: string; expiresIn: number; isNewUser: boolean }>(
        instance.post("/auth/phone", { phone }),
      ),
    sendOtp: (phone: string) =>
      unwrap<{ message: string; expiresIn: number }>(
        instance.post("/auth/send-otp", { phone }),
      ),
    verifyOtp: (phone: string, code: string) =>
      unwrap<{ accessToken: string; refreshToken: string; expiresIn: number; isNewUser: boolean }>(
        instance.post("/auth/verify-otp", { phone, code }),
      ),
    refresh: (refreshToken: string) =>
      unwrap<{ accessToken: string; refreshToken: string; expiresIn: number }>(
        plainAxios.post("/auth/refresh", { refreshToken }),
      ),
    logout: (refreshToken: string) =>
      unwrap<{ message: string }>(
        instance.post("/auth/logout", { refreshToken }),
      ),
    logoutAll: () =>
      unwrap<{ message: string }>(instance.post("/auth/logout-all")),
  },

  users: {
    getProfile: () =>
      dedupeGet("profile", () =>
        unwrap<Record<string, unknown>>(instance.get("/users/me"))),
    updateProfile: (data: { name?: string; email?: string; dob?: string }) =>
      unwrap<Record<string, unknown>>(instance.patch("/users/me", data)),
    getAddresses: () => unwrap<unknown[]>(instance.get("/users/me/addresses")),
    getAddress: (id: string) =>
      unwrap<unknown>(instance.get(`/users/me/addresses/${id}`)),
    createAddress: (data: unknown) =>
      unwrap<unknown>(instance.post("/users/me/addresses", data)),
    updateAddress: (id: string, data: unknown) =>
      unwrap<unknown>(instance.patch(`/users/me/addresses/${id}`, data)),
    deleteAddress: (id: string) =>
      unwrap<unknown>(instance.delete(`/users/me/addresses/${id}`)),
  },

  products: {
    getProducts: (params?: Record<string, unknown>) =>
      unwrapPaginated<unknown>(instance.get("/products", { params })),
    getById: (id: string) => unwrap<unknown>(instance.get(`/products/${id}`)),
    getBySlug: (slug: string) =>
      unwrap<unknown>(instance.get(`/products/by-slug/${slug}`)),
    searchProducts: (q: string, params?: Record<string, unknown>) =>
      unwrapPaginated<unknown>(
        instance.get("/products/search", { params: { q, ...params } }),
      ),
    getUnderPrice: (amount: number, params?: Record<string, unknown>) =>
      unwrapPaginated<unknown>(
        instance.get(`/products/under-price/${amount}`, { params }),
      ),
  },

  categories: {
    getTree: (params?: Record<string, unknown>) =>
      unwrap<unknown[]>(instance.get("/categories/tree", { params })),
    getBySlug: (slug: string) =>
      unwrap<unknown>(instance.get(`/categories/by-slug/${slug}`)),
  },

  banners: {
    getBanners: () => unwrap<unknown[]>(instance.get("/banners")),
    getByType: (type: string) =>
      unwrap<unknown[]>(instance.get(`/banners/by-type/${type}`)),
  },

  cart: {
    getCart: () => dedupeGet("cart", () => unwrap<unknown>(instance.get("/cart"))),
    addItem: (data: {
      productId: string;
      quantity: number;
      variantId?: string;
      customization?: unknown;
      customImageUrl?: string;
    }) => unwrap<unknown>(instance.post("/cart/items", data)),
    uploadPhoto: (file: File) => {
      const form = new FormData();
      form.append("image", file);
      return unwrap<{ url: string }>(instance.post("/cart/upload-photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }));
    },
    updateItem: (
      id: string,
      data: { quantity: number; customization?: unknown },
    ) => unwrap<unknown>(instance.patch(`/cart/items/${id}`, data)),
    removeItem: (id: string) =>
      unwrap<unknown>(instance.delete(`/cart/items/${id}`)),
    clearCart: () => unwrap<unknown>(instance.delete("/cart")),
    calculate: (data: { couponCode?: string; pincode?: string }) =>
      unwrap<unknown>(instance.post("/cart/calculate", data)),
  },

  orders: {
    create: (data: { addressId: string; couponCode?: string }, idempotencyKey?: string) =>
      unwrap<unknown>(instance.post(
        "/orders",
        data,
        idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined,
      )),
    list: (params?: Record<string, unknown>) =>
      unwrap<unknown>(instance.get("/orders", { params })),
    getById: (id: string) => unwrap<unknown>(instance.get(`/orders/${id}`)),
    getByNumber: (orderNumber: string) =>
      unwrap<unknown>(instance.get(`/orders/by-number/${orderNumber}`)),
    cancel: (id: string) =>
      unwrap<unknown>(instance.post(`/orders/${id}/cancel`)),
    requestRefund: (id: string, data: { reason: string; videoUrl?: string }) =>
      unwrap<unknown>(instance.post(`/orders/${id}/refund`, data)),
  },

  payments: {
    create: (orderId: string) =>
      unwrap<PaymentOrderResponse>(
        instance.post(
          "/payments/create",
          { orderId },
          {
            headers: { "Idempotency-Key": `payment-${orderId}` },
          },
        ),
      ),
    verify: (data: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => unwrap<unknown>(instance.post("/payments/verify", data)),
    cashOnDelivery: (orderId: string) =>
      unwrap<unknown>(
        instance.post(
          "/payments/cash-on-delivery",
          { orderId },
          { headers: { "Idempotency-Key": `cod-${orderId}` } },
        ),
      ),
    getByOrderId: (orderId: string) =>
      unwrap<unknown>(instance.get(`/payments/order/${orderId}`)),
  },

  wishlist: {
    get: () => unwrap<unknown[]>(instance.get("/wishlist")),
    check: (productId: string) =>
      unwrap<unknown>(
        instance.get("/wishlist/check", { params: { productId } }),
      ),
    add: (productId: string) =>
      unwrap<unknown>(instance.post("/wishlist", { productId })),
    toggle: (productId: string) =>
      unwrap<unknown>(instance.post("/wishlist/toggle", { productId })),
    remove: (productId: string) =>
      unwrap<unknown>(instance.delete(`/wishlist/${productId}`)),
    clear: () => unwrap<unknown>(instance.delete("/wishlist")),
  },

  reviews: {
    getForProduct: (productId: string, params?: Record<string, unknown>) =>
      unwrap<unknown>(
        instance.get(`/reviews/product/${productId}`, { params }),
      ),
    getSummary: (productId: string) =>
      unwrap<unknown>(instance.get(`/reviews/product/${productId}/summary`)),
    getUserReviews: () =>
      unwrap<unknown[]>(instance.get("/reviews/my-reviews")),
    canReview: (productId: string) =>
      unwrap<unknown>(
        instance.get("/reviews/can-review", { params: { productId } }),
      ),
    create: (data: {
      productId: string;
      orderId?: string;
      rating: number;
      title?: string;
      body: string;
      images?: string[];
    }) => unwrap<unknown>(instance.post("/reviews", data)),
    update: (
      id: string,
      data: {
        rating?: number;
        title?: string;
        body?: string;
        images?: string[];
      },
    ) => unwrap<unknown>(instance.patch(`/reviews/${id}`, data)),
    delete: (id: string) => unwrap<unknown>(instance.delete(`/reviews/${id}`)),
    markHelpful: (id: string) =>
      unwrap<unknown>(instance.post(`/reviews/${id}/helpful`)),
  },

  referrals: {
    getMyCode: () => unwrap<unknown>(instance.get("/referrals/my-code")),
    createCode: (data: {
      discountPercent: number;
      commissionPercent: number;
      usageLimit?: number;
    }) => unwrap<unknown>(instance.post("/referrals", data)),
    validate: (code: string) =>
      unwrap<unknown>(
        instance.get("/referrals/validate", { params: { code } }),
      ),
    getHistory: () => unwrap<unknown[]>(instance.get("/referrals/my-history")),
  },

  blog: {
    list: (params?: Record<string, unknown>) =>
      unwrap<unknown>(instance.get("/blog", { params })),
    getBySlug: (slug: string) =>
      unwrap<unknown>(instance.get(`/blog/by-slug/${slug}`)),
  },

  faqs: {
    list: (params?: Record<string, unknown>) =>
      unwrap<unknown[]>(instance.get("/faqs", { params })),
    getCategories: () => unwrap<string[]>(instance.get("/faqs/categories")),
    getByCategory: (category: string) =>
      unwrap<unknown[]>(instance.get(`/faqs/category/${category}`)),
  },

  newsletter: {
    subscribe: (email: string, name?: string) =>
      unwrap<{ message: string }>(
        instance.post("/newsletter/subscribe", { email, name }),
      ),
    unsubscribe: (email: string) =>
      unwrap<{ message: string }>(
        instance.post("/newsletter/unsubscribe", { email }),
      ),
  },
  bulkOrders: {
    create: (data: {
      name: string;
      email: string;
      phone: string;
      company?: string;
      quantity: number;
      message?: string;
    }) =>
      unwrap<{ id: string; message: string }>(
        instance.post("/bulk-orders", data),
      ),
  },
};

export default instance;
