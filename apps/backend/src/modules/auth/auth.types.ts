import type { User, RefreshToken, SmsOtpToken } from '@prisma/client';
import type { TokenPair } from '../../shared/types/index.js';

/**
 * Token payload for JWT
 */
export interface TokenPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Auth service interface
 */
export interface IAuthService {
  sendOtp(
    phone: string,
    ipAddress: string,
  ): Promise<{ expiresIn: number }>;

  verifyOtp(
    phone: string,
    code: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair & { isNewUser: boolean }>;

  authenticateWithPhone(
    phone: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair & { isNewUser: boolean }>;

  authenticateDashboardAdmin(
    email: string,
    password: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(
    refreshToken: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair>;

  /**
   * Logout user and revoke refresh token
   */
  logout(refreshToken: string): Promise<void>;

  /**
   * Logout from all devices
   */
  logoutAll(userId: string): Promise<void>;
}

/**
 * Auth repository interface
 */
export interface IAuthRepository {
  // SMS OTP tokens
  createSmsOtpToken(
    phone: string,
    codeHash: string,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<SmsOtpToken>;

  findValidSmsOtpToken(phone: string): Promise<SmsOtpToken | null>;

  incrementSmsOtpVerifyAttempts(id: string): Promise<void>;

  markSmsOtpConsumed(id: string): Promise<void>;

  countSmsOtpTokensByPhone(phone: string, since: Date): Promise<number>;

  countSmsOtpTokensByIp(ipAddress: string, since: Date): Promise<number>;

  // Users
  findUserByPhone(phone: string): Promise<User | null>;

  findUserByEmail(email: string): Promise<User | null>;

  findUserById(userId: string): Promise<User | null>;

  createPhoneUser(phone: string, email: string): Promise<User>;

  markPhoneVerified(userId: string, phone: string): Promise<void>;

  updateLastLogin(userId: string): Promise<void>;

  // Refresh tokens
  createRefreshToken(
    userId: string,
    tokenHash: string,
    family: string,
    expiresAt: Date,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<RefreshToken>;

  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;

  revokeRefreshToken(tokenHash: string): Promise<void>;

  revokeAllUserTokens(userId: string): Promise<void>;

  revokeTokenFamily(family: string): Promise<void>;
}