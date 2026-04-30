import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { HttpError } from '../middleware/errorHandler';
import { reviewSchema } from '../schemas';

export const reviewsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = reviewSchema.parse(req.body);
      const product = await Product.findById(data.productId);
      if (!product) throw new HttpError(404, 'Produto não encontrado');

      const existing = await Review.findOne({
        userId: req.userId,
        productId: data.productId,
      });

      if (existing) {
        existing.rating = data.rating;
        existing.comment = data.comment;
        await existing.save();
        return res.json({ review: existing });
      }

      const review = await Review.create({
        userId: req.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      });
      res.status(201).json({ review });
    } catch (err) {
      next(err);
    }
  },

  async listByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await Review.find({ productId: req.params.productId })
        .sort({ createdAt: -1 })
        .populate('userId', 'name');
      const avg =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;
      res.json({
        reviews,
        averageRating: Math.round(avg * 10) / 10,
        total: reviews.length,
      });
    } catch (err) {
      next(err);
    }
  },
};
