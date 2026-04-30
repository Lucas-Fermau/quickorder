import { Router } from 'express';
import { productsController } from '../controllers/products.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

export const productsRouter = Router();

productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getById);

productsRouter.post('/admin', authenticate, requireAdmin, productsController.create);
productsRouter.put('/admin/:id', authenticate, requireAdmin, productsController.update);
productsRouter.delete('/admin/:id', authenticate, requireAdmin, productsController.remove);
