import { Router } from 'express';
import { ImageController } from './image.controller.js';

export function createImageRoutes(): Router {
  const router = Router();
  const controller = new ImageController();

  router.get('/proxy', controller.proxyImage);

  return router;
}

export default createImageRoutes;
