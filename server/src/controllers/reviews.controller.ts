import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { HttpError } from '../middleware/errorHandler';
import { reviewSchema } from '../schemas';

export const reviewsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = reviewSchema.parse(req.body);
      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new HttpError(404, 'Produto não encontrado');

      const review = await prisma.review.upsert({
        where: {
          userId_productId: { userId: req.userId!, productId: data.productId },
        },
        create: {
          userId: req.userId!,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment,
        },
        update: {
          rating: data.rating,
          comment: data.comment,
        },
      });
      res.status(201).json({ review });
    } catch (err) {
      next(err);
    }
  },

  async listByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await prisma.review.findMany({
        where: { productId: req.params.productId },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      });
      const avg =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

      const shaped = reviews.map((r) => ({
        id: r.id,
        userId: r.user,
        productId: r.productId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }));

      res.json({
        reviews: shaped,
        averageRating: Math.round(avg * 10) / 10,
        total: reviews.length,
      });
    } catch (err) {
      next(err);
    }
  },
};
