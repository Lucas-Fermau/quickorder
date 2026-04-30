import { Router } from 'express';
import { favoritesController } from '../controllers/favorites.controller';
import { authenticate } from '../middleware/auth';

export const favoritesRouter = Router();

favoritesRouter.use(authenticate);

favoritesRouter.get('/', favoritesController.list);
favoritesRouter.post('/:productId', favoritesController.add);
favoritesRouter.delete('/:productId', favoritesController.remove);
