/**
 * Shared constants used across the application
 */

// Validation constants
export const VALIDATION = {
  PHONE_REGEX: /^[6-9]\d{9}$/,
  PINCODE_REGEX: /^\d{6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 5000,
} as const;

// Error codes
export const ERROR_CODES = {
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Auth specific
  INVALID_OTP: 'INVALID_OTP',
  EXPIRED_OTP: 'EXPIRED_OTP',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  
  // Order specific
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_COUPON: 'INVALID_COUPON',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
  
  // Payment specific
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
} as const;

// API response messages
export const MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  LOGGED_OUT: 'Logged out successfully',
  ORDER_PLACED: 'Order placed successfully',
  PAYMENT_SUCCESS: 'Payment successful',
} as const;
