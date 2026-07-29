import type { Request, Response, NextFunction } from 'express';
import type { IAuthService } from './auth.types.js';
import {
  phoneLoginSchema,
  dashboardLoginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  logoutSchema,
} from './auth.schema.js';

/**
 * Auth controller
 * Thin HTTP layer — all business logic lives in the service
 */
export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  private meta(req: Request) {
    return {
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
    };
  }
  /**
   * POST /auth/phone
   */
  phoneLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone } = phoneLoginSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.authenticateWithPhone(phone, deviceInfo, ipAddress);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
          isNewUser: result.isNewUser,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/dashboard-login
   */
  dashboardLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = dashboardLoginSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.authenticateDashboardAdmin(
        email,
        password,
        deviceInfo,
        ipAddress,
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/send-otp
   */
  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone } = sendOtpSchema.parse(req.body);
      const ipAddress = req.ip || 'unknown';

      const result = await this.authService.sendOtp(phone, ipAddress);

      res.status(200).json({
        success: true,
        data: {
          message: 'OTP sent to your phone',
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/verify-otp
   */
  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, code } = verifyOtpSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.verifyOtp(phone, code, deviceInfo, ipAddress);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
          isNewUser: result.isNewUser,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/refresh
   */
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.refreshToken(
        refreshToken,
        deviceInfo,
        ipAddress,
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = logoutSchema.parse(req.body);

      await this.authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };
}