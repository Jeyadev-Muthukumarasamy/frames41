import type { Request, Response, NextFunction } from 'express';
import type { IUserService } from './user.types.js';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from './user.schema.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

/**
 * User controller
 */
export class UserController {
  private readonly userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  /**
   * GET /users/me
   * Get current user profile
   */
  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const user = await this.userService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          dob: user.dob ? user.dob.toISOString().split('T')[0] : null,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /users/me
   * Update current user profile
   */
  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const data = updateProfileSchema.parse(req.body);
      const user = await this.userService.updateProfile(req.user.userId, data);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          dob: user.dob ? user.dob.toISOString().split('T')[0] : null,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /users/me/addresses
   * Get user addresses
   */
  getAddresses = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const addresses = await this.userService.getAddresses(req.user.userId);

      res.status(200).json({
        success: true,
        data: addresses.map((addr) => ({
          id: addr.id,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          isDefault: addr.isDefault,
          createdAt: addr.createdAt.toISOString(),
        })),
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /users/me/addresses/:id
   * Get single address
   */
  getAddress = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const { id } = addressIdParamSchema.parse(req.params);
      const address = await this.userService.getAddress(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: {
          id: address.id,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
          createdAt: address.createdAt.toISOString(),
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /users/me/addresses
   * Create address
   */
  createAddress = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const data = createAddressSchema.parse(req.body);
      const address = await this.userService.createAddress(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: {
          id: address.id,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
          createdAt: address.createdAt.toISOString(),
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /users/me/addresses/:id
   * Update address
   */
  updateAddress = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const { id } = addressIdParamSchema.parse(req.params);
      const data = updateAddressSchema.parse(req.body);
      const address = await this.userService.updateAddress(req.user.userId, id, data);

      res.status(200).json({
        success: true,
        data: {
          id: address.id,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
          createdAt: address.createdAt.toISOString(),
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /users/me/addresses/:id
   * Delete address
   */
  deleteAddress = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const { id } = addressIdParamSchema.parse(req.params);
      await this.userService.deleteAddress(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: { message: 'Address deleted successfully' },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
