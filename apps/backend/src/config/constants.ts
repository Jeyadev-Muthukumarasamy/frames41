/**
 * Application constants
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Email Verification Configuration
export const EMAIL_VERIFICATION_CONFIG = {
  CODE_LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS_PER_IP_PER_WINDOW: 5,
  MAX_ATTEMPTS_PER_EMAIL_PER_DAY: 10,
  IP_WINDOW_MINUTES: 60,
  EMAIL_WINDOW_HOURS: 24,
  MAX_VERIFY_ATTEMPTS: 5,
} as const;
// SMS OTP Configuration
export const SMS_OTP_CONFIG = {
  CODE_LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS_PER_IP_PER_WINDOW: 5,
  MAX_ATTEMPTS_PER_PHONE_PER_DAY: 10,
  IP_WINDOW_MINUTES: 60,
  PHONE_WINDOW_HOURS: 24,
  MAX_VERIFY_ATTEMPTS: 5,
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  REFRESH_TOKEN_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  SEARCH: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 30,
  },
  ORDER: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 3,
  },
  DEFAULT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    // The global limiter and several route limiters both run for catalog calls.
    // Keep this high enough for image-heavy storefront navigation; sensitive
    // auth/search/order endpoints retain their stricter dedicated limits.
    MAX_REQUESTS: 1000,
  },
} as const;

// Cache TTL (in milliseconds)
export const CACHE_TTL = {
  PRODUCT_DETAIL: 5 * 60 * 1000, // 5 minutes
  CATEGORY_TREE: 30 * 60 * 1000, // 30 minutes
  SHIPROCKET_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
  SHIPPING_RATES: 60 * 60 * 1000, // 1 hour
  PINCODE_SERVICEABILITY: 7 * 24 * 60 * 60 * 1000, // 7 days
  IDEMPOTENCY_KEY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// LRU Cache Configuration
export const LRU_CACHE_CONFIG = {
  MAX_SIZE: 1000,
  TTL: 5 * 60 * 1000, // 5 minutes default
} as const;

// File Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_FILES: 3,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// Coupon Types
export const COUPON_TYPES = {
  PERCENT: 'PERCENT',
  FLAT: 'FLAT',
  FIRST_ORDER: 'FIRST_ORDER',
} as const;

// Banner Types
export const BANNER_TYPES = {
  TOP_STRIP: 'TOP_STRIP',
  HEADER_SLIDER: 'HEADER_SLIDER',
  UNDER_999: 'UNDER_999',
} as const;

// Job Status
export const JOB_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BACKOFF_MULTIPLIER: 2,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
} as const;

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  DECIMAL_PLACES: 2,
} as const;

// Shipping
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 799,
  DEFAULT_SHIPPING_CHARGE: 79,
} as const;
