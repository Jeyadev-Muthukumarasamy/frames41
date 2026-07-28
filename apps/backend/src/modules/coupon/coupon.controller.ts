import type { NextFunction, Request, Response } from 'express';
import { CouponService } from './coupon.service.js';
import {
  couponIdParamSchema,
  createCouponSchema,
  updateCouponSchema,
} from './coupon.schema.js';

export class CouponController {
  constructor(private readonly service: CouponService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = await this.service.getCouponsForAdmin();
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.service.createCouponForAdmin(createCouponSchema.parse(req.body));
      res.status(201).json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = couponIdParamSchema.parse(req.params);
      const coupon = await this.service.updateCouponForAdmin(id, updateCouponSchema.parse(req.body));
      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

  archive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = couponIdParamSchema.parse(req.params);
      await this.service.archiveCoupon(id);
      res.status(200).json({ success: true, data: { message: 'Coupon deactivated' } });
    } catch (error) {
      next(error);
    }
  };
}
