import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { HttpError } from '../middleware/errorHandler';

export const favoritesController = {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
      if (!product) throw new HttpError(404, 'Produto não encontrado');

      try {
        const fav = await prisma.favorite.create({
          data: { userId: req.userId!, productId: req.params.productId },
        });
        res.status(201).json({ favorite: fav });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
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
      await prisma.favorite.delete({
        where: {
          userId_productId: { userId: req.userId!, productId: req.params.productId },
        },
      });
      res.status(204).send();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return next(new HttpError(404, 'Favorito não encontrado'));
      }
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        include: { product: true },
      });

      const shaped = favorites.map((f) => ({
        id: f.id,
        productId: f.product,
        createdAt: f.createdAt,
      }));

      res.json({ favorites: shaped });
    } catch (err) {
      next(err);
    }
  },
};
