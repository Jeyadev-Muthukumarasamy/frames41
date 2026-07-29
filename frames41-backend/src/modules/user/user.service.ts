import type { User, Address } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError.js';
import type { IUserRepository, IUserService } from './user.types.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';

/**
 * User service implementation
 */
export class UserService implements IUserService {
  private readonly repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string | null; dob?: string | null },
  ): Promise<User> {
    const updateData: Partial<User> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email ?? '';
    }

    if (data.dob !== undefined) {
      updateData.dob = data.dob ? new Date(data.dob) : null;
    }

    const user = await this.repository.update(userId, updateData);
    logger.info({ userId }, 'User profile updated');

    return user;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.repository.findAddressesByUserId(userId);
  }

  async getAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.repository.findAddressById(addressId);

    if (!address) {
      throw new NotFoundError('Address');
    }

    if (address.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this address');
    }

    return address;
  }

  async createAddress(
    userId: string,
    data: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault?: boolean;
    },
  ): Promise<Address> {
    // If this is the first address, make it default
    const addressCount = await this.repository.countAddresses(userId);
    const isDefault = data.isDefault || addressCount === 0;

    const address = await this.repository.createAddress(userId, {
      ...data,
      line2: data.line2 ?? null,
      isDefault,
    });

    // If setting as default and there are other addresses, update them
    if (isDefault && addressCount > 0) {
      await this.repository.setDefaultAddress(userId, address.id);
    }

    logger.info({ userId, addressId: address.id }, 'Address created');

    return address;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<{
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault: boolean;
    }>,
  ): Promise<Address> {
    // Verify ownership
    const existing = await this.getAddress(userId, addressId);

    // If setting as default
    if (data.isDefault && !existing.isDefault) {
      await this.repository.setDefaultAddress(userId, addressId);
    }

    const updateData: Partial<Address> = {};
    if (data.line1 !== undefined) updateData.line1 = data.line1;
    if (data.line2 !== undefined) updateData.line2 = data.line2;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    const address = await this.repository.updateAddress(addressId, updateData);
    logger.info({ userId, addressId }, 'Address updated');

    return address;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    // Verify ownership
    await this.getAddress(userId, addressId);

    await this.repository.deleteAddress(addressId);
    logger.info({ userId, addressId }, 'Address deleted');
  }
}
