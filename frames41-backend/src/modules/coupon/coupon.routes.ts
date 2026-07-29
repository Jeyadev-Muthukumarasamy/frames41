import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { CouponController } from './coupon.controller.js';
import { CouponService } from './coupon.service.js';

export function createCouponRoutes(): Router {
  const router = Router();
  const controller = new CouponController(new CouponService());

  router.use(authenticate);
  router.use(requireAdmin);
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.archive);

  return router;
}

export default createCouponRoutes;
