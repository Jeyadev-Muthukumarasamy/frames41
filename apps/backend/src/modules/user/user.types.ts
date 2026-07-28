import type { User, Address, PrismaClient } from '@prisma/client';

/**
 * User repository interface
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Update user profile
   */
  update(id: string, data: Partial<User>): Promise<User>;

  /**
   * Find address by ID
   */
  findAddressById(id: string): Promise<Address | null>;

  /**
   * Find addresses by user ID
   */
  findAddressesByUserId(userId: string): Promise<Address[]>;

  /**
   * Create address
   */
  createAddress(userId: string, data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address>;

  /**
   * Update address
   */
  updateAddress(id: string, data: Partial<Address>): Promise<Address>;

  /**
   * Delete address
   */
  deleteAddress(id: string): Promise<void>;

  /**
   * Set address as default (and unset others)
   */
  setDefaultAddress(userId: string, addressId: string): Promise<void>;

  /**
   * Count addresses for user
   */
  countAddresses(userId: string): Promise<number>;
}

/**
 * User service interface
 */
export interface IUserService {
  /**
   * Get user profile
   */
  getProfile(userId: string): Promise<User>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: { name?: string; email?: string | null; dob?: string | null }): Promise<User>;

  /**
   * Get user addresses
   */
  getAddresses(userId: string): Promise<Address[]>;

  /**
   * Get single address
   */
  getAddress(userId: string, addressId: string): Promise<Address>;

  /**
   * Create address
   */
  createAddress(
    userId: string,
    data: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault?: boolean;
    },
  ): Promise<Address>;

  /**
   * Update address
   */
  updateAddress(
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
  ): Promise<Address>;

  /**
   * Delete address
   */
  deleteAddress(userId: string, addressId: string): Promise<void>;
}
