import { hash, verify } from 'argon2';
import { randomBytes, createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { JWT_CONFIG, SMS_OTP_CONFIG } from '../../config/constants.js';
import { BadRequestError, UnauthorizedError, RateLimitError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { sendSms } from '../../infrastructure/external/twilio.client.js';
import type { IAuthRepository, IAuthService } from './auth.types.js';
import type { TokenPair } from '../../shared/types/index.js';

function generateCode(): string {
  const buffer = randomBytes(4);
  const num = buffer.readUInt32BE(0);
  return String(num % 1000000).padStart(6, '0');
}

async function hashCode(code: string): Promise<string> {
  return hash(code, {
    type: 2,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim().replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  if (/^91\d{10}$/.test(trimmed)) return `+${trimmed}`;
  if (trimmed.startsWith('+')) return trimmed;
  return `+${trimmed}`;
}

function phoneToInternalEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `phone-${digits}@otp.frames41.local`;
}

function generateTokenFamily(): string {
  return randomBytes(16).toString('hex');
}

export class AuthService implements IAuthService {
  private readonly repository: IAuthRepository;

  constructor(repository: IAuthRepository) {
    this.repository = repository;
  }

  async sendOtp(phone: string, ipAddress: string): Promise<{ expiresIn: number }> {
    const normalizedPhone = normalizePhone(phone);

    await this.checkSmsRateLimits(normalizedPhone, ipAddress);
    await this.issueSmsOtp(normalizedPhone, ipAddress);

    return { expiresIn: SMS_OTP_CONFIG.EXPIRY_MINUTES * 60 };
  }

  async verifyOtp(
    phone: string,
    code: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair & { isNewUser: boolean }> {
    const normalizedPhone = normalizePhone(phone);
    const attempt = await this.repository.findValidSmsOtpToken(normalizedPhone);

    if (!attempt) throw new BadRequestError('Invalid or expired OTP');

    if (attempt.verifyAttempts >= SMS_OTP_CONFIG.MAX_VERIFY_ATTEMPTS) {
      await this.repository.markSmsOtpConsumed(attempt.id);
      throw new BadRequestError('Too many OTP attempts, request a new code');
    }

    await this.repository.incrementSmsOtpVerifyAttempts(attempt.id);

    const isValid = await verify(attempt.codeHash, code);
    if (!isValid) throw new BadRequestError('Invalid OTP');

    await this.repository.markSmsOtpConsumed(attempt.id);

    let user = await this.repository.findUserByPhone(normalizedPhone);
    const isNewUser = !user;

    if (!user) {
      user = await this.repository.createPhoneUser(
        normalizedPhone,
        phoneToInternalEmail(normalizedPhone),
      );
    } else if (!user.isVerified || user.phoneVerifiedAt === null) {
      await this.repository.markPhoneVerified(user.id, normalizedPhone);
    }

    await this.repository.updateLastLogin(user.id);

    const tokens = await this.generateTokenPair(
      user.id,
      user.role,
      deviceInfo,
      ipAddress,
    );

    logger.info({ userId: user.id, phone: normalizedPhone }, 'User authenticated with phone OTP');
    return { ...tokens, isNewUser };
  }

  async authenticateWithPhone(
    phone: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair & { isNewUser: boolean }> {
    const normalizedPhone = normalizePhone(phone);

    let user = await this.repository.findUserByPhone(normalizedPhone);
    const isNewUser = !user;

    if (!user) {
      user = await this.repository.createPhoneUser(
        normalizedPhone,
        phoneToInternalEmail(normalizedPhone),
      );
    } else if (!user.isVerified || user.phoneVerifiedAt === null) {
      await this.repository.markPhoneVerified(user.id, normalizedPhone);
    }

    await this.repository.updateLastLogin(user.id);

    const tokens = await this.generateTokenPair(
      user.id,
      user.role,
      deviceInfo,
      ipAddress,
    );

    logger.info({ userId: user.id, phone: normalizedPhone }, 'User authenticated with phone number');
    return { ...tokens, isNewUser };
  }

  async authenticateDashboardAdmin(
    email: string,
    password: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair> {
    const user = await this.repository.findUserByEmail(email);

    if (!user?.passwordHash) throw new UnauthorizedError('Invalid email or password');

    const isValid = await verify(user.passwordHash, password);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    if (user.role !== 'ADMIN') throw new UnauthorizedError('Dashboard access requires an admin account');
    if (!user.isVerified) throw new UnauthorizedError('Admin account is not verified');

    await this.repository.updateLastLogin(user.id);

    const tokens = await this.generateTokenPair(
      user.id,
      user.role,
      deviceInfo,
      ipAddress,
    );

    logger.info({ userId: user.id }, 'Admin authenticated for dashboard');
    return tokens;
  }

  async refreshToken(
    refreshToken: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair> {
    const tokenHash = hashToken(refreshToken);
    const storedToken = await this.repository.findRefreshToken(tokenHash);

    if (!storedToken) throw new UnauthorizedError('Invalid refresh token');

    if (storedToken.revokedAt) {
      await this.repository.revokeTokenFamily(storedToken.family);
      logger.warn({ userId: storedToken.userId, family: storedToken.family }, 'Token reuse detected');
      throw new UnauthorizedError('Token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.repository.revokeRefreshToken(tokenHash);
      throw new UnauthorizedError('Refresh token expired');
    }

    await this.repository.revokeRefreshToken(tokenHash);

    const user = await this.repository.findUserById(storedToken.userId);
    if (!user) throw new UnauthorizedError('Invalid refresh token');

    const tokens = await this.generateTokenPair(
      storedToken.userId,
      user.role,
      deviceInfo,
      ipAddress,
      storedToken.family,
    );

    logger.info({ userId: storedToken.userId }, 'Token refreshed');
    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.repository.revokeRefreshToken(tokenHash);
    logger.info('User logged out');
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repository.revokeAllUserTokens(userId);
    logger.info({ userId }, 'User logged out from all devices');
  }

  private async checkSmsRateLimits(phone: string, ipAddress: string): Promise<void> {
    if (env.NODE_ENV === 'development') return;

    const ipWindowStart = new Date(
      Date.now() - SMS_OTP_CONFIG.IP_WINDOW_MINUTES * 60 * 1000,
    );
    const ipAttempts = await this.repository.countSmsOtpTokensByIp(ipAddress, ipWindowStart);

    if (ipAttempts >= SMS_OTP_CONFIG.MAX_ATTEMPTS_PER_IP_PER_WINDOW) {
      logger.warn({ phone, ipAddress }, 'SMS OTP rate limit exceeded for IP');
      throw new RateLimitError(Math.ceil(SMS_OTP_CONFIG.IP_WINDOW_MINUTES * 60));
    }

    const phoneWindowStart = new Date(
      Date.now() - SMS_OTP_CONFIG.PHONE_WINDOW_HOURS * 60 * 60 * 1000,
    );
    const phoneAttempts = await this.repository.countSmsOtpTokensByPhone(phone, phoneWindowStart);

    if (phoneAttempts >= SMS_OTP_CONFIG.MAX_ATTEMPTS_PER_PHONE_PER_DAY) {
      logger.warn({ phone }, 'SMS OTP rate limit exceeded for phone');
      throw new RateLimitError(Math.ceil(SMS_OTP_CONFIG.PHONE_WINDOW_HOURS * 60 * 60));
    }
  }

  private async issueSmsOtp(phone: string, ipAddress: string): Promise<void> {
    const code = generateCode();
    const codeHash = await hashCode(code);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + SMS_OTP_CONFIG.EXPIRY_MINUTES);

    await this.repository.createSmsOtpToken(phone, codeHash, ipAddress, expiresAt);

    if (env.NODE_ENV === 'development') {
      logger.info({ phone, code }, 'SMS OTP generated (dev mode)');
    }

    await sendSms({
      to: phone,
      body: `Your Frames41 verification code is ${code}. It expires in ${SMS_OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
    });

    logger.info({ phone }, 'SMS OTP issued');
  }

  private async generateTokenPair(
    userId: string,
    role: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
    existingFamily?: string,
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { userId, role, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'] },
    );

    const refreshToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + JWT_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS);

    const family = existingFamily || generateTokenFamily();

    await this.repository.createRefreshToken(
      userId,
      tokenHash,
      family,
      expiresAt,
      deviceInfo,
      ipAddress,
    );

    const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    return { accessToken, refreshToken, expiresIn };
  }
}