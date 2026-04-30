import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post('/', ordersController.create);
ordersRouter.get('/my-orders', ordersController.myOrders);
ordersRouter.get('/admin', requireAdmin, ordersController.listAll);
ordersRouter.get('/admin/stats', requireAdmin, ordersController.stats);
ordersRouter.get('/:id', ordersController.getById);
ordersRouter.patch('/admin/:id/status', requireAdmin, ordersController.updateStatus);
