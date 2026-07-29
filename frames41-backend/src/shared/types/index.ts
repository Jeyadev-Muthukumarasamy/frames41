/**
 * Shared types used across the application
 */

// Pagination
export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

// Result type for functional error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// JWT Payload
export interface JwtPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// Authenticated Request
export interface AuthenticatedUser {
  userId: string;
  role: string;
}

// Token pair
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Sort options
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}
