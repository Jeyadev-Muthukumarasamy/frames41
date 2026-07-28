import type { User, Address, PrismaClient } from '@prisma/client';
import type { IUserRepository } from './user.types.js';

/**
 * User repository implementation
 */
export class UserRepository implements IUserRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAddressById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id },
    });
  }

  async findAddressesByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createAddress(
    userId: string,
    data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Address> {
    return this.prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async deleteAddress(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await this.prisma.$transaction([
      // Unset all other defaults
      this.prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: { isDefault: false },
      }),
      // Set new default
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);
  }

  async countAddresses(userId: string): Promise<number> {
    return this.prisma.address.count({
      where: { userId },
    });
  }
}
