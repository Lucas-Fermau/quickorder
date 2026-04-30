import { Router } from 'express';
import { reviewsController } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';

export const reviewsRouter = Router();

reviewsRouter.post('/', authenticate, reviewsController.create);
reviewsRouter.get('/product/:productId', reviewsController.listByProduct);
