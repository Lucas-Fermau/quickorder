import { Request, Response, NextFunction } from 'express';
import { Favorite } from '../models/Favorite';
import { Product } from '../models/Product';
import { HttpError } from '../middleware/errorHandler';

export const favoritesController = {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) throw new HttpError(404, 'Produto não encontrado');

      try {
        const fav = await Favorite.create({
          userId: req.userId,
          productId: req.params.productId,
        });
        res.status(201).json({ favorite: fav });
      } catch (err) {
        if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
          return res.status(200).json({ message: 'Produto já está nos favoritos' });
        }
        throw err;
      }
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await Favorite.findOneAndDelete({
        userId: req.userId,
        productId: req.params.productId,
      });
      if (!result) throw new HttpError(404, 'Favorito não encontrado');
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const favorites = await Favorite.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .populate('productId');
      res.json({ favorites });
    } catch (err) {
      next(err);
    }
  },
};
