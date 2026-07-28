import type {
  User,
  RefreshToken,
  SmsOtpToken,
  PrismaClient,
} from '@prisma/client';
import type { IAuthRepository } from './auth.types.js';

export class AuthRepository implements IAuthRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSmsOtpToken(
    phone: string,
    codeHash: string,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<SmsOtpToken> {
    return this.prisma.smsOtpToken.create({
      data: { phone, codeHash, ipAddress, expiresAt },
    });
  }

  async findValidSmsOtpToken(phone: string): Promise<SmsOtpToken | null> {
    return this.prisma.smsOtpToken.findFirst({
      where: {
        phone,
        expiresAt: { gt: new Date() },
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementSmsOtpVerifyAttempts(id: string): Promise<void> {
    await this.prisma.smsOtpToken.update({
      where: { id },
      data: { verifyAttempts: { increment: 1 } },
    });
  }

  async markSmsOtpConsumed(id: string): Promise<void> {
    await this.prisma.smsOtpToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async countSmsOtpTokensByPhone(phone: string, since: Date): Promise<number> {
    return this.prisma.smsOtpToken.count({
      where: { phone, createdAt: { gte: since } },
    });
  }

  async countSmsOtpTokensByIp(ipAddress: string, since: Date): Promise<number> {
    return this.prisma.smsOtpToken.count({
      where: { ipAddress, createdAt: { gte: since } },
    });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async createPhoneUser(phone: string, email: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        phone,
        isVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });
  }

  async markPhoneVerified(userId: string, phone: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { phone, isVerified: true, phoneVerifiedAt: new Date() },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async createRefreshToken(
    userId: string,
    tokenHash: string,
    family: string,
    expiresAt: Date,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<RefreshToken> {
    const data: {
      userId: string;
      tokenHash: string;
      family: string;
      expiresAt: Date;
      deviceInfo?: string;
      ipAddress?: string;
    } = { userId, tokenHash, family, expiresAt };
    if (deviceInfo) data.deviceInfo = deviceInfo;
    if (ipAddress) data.ipAddress = ipAddress;
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeTokenFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        family,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}