import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { HttpError } from '../middleware/errorHandler';
import {
  productListQuerySchema,
  productSchema,
  productUpdateSchema,
} from '../schemas';

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productListQuerySchema.parse(req.query);
      const filter: Record<string, unknown> = {};
      if (query.category) filter.category = query.category;
      if (query.featured !== undefined) filter.featured = query.featured;
      if (query.available !== undefined) filter.available = query.available;
      if (query.search) {
        const re = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: re }, { description: re }];
      }
      const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
      res.json({ products });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) throw new HttpError(404, 'Produto não encontrado');
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productSchema.parse(req.body);
      const product = await Product.create(data);
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productUpdateSchema.parse(req.body);
      const product = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
      });
      if (!product) throw new HttpError(404, 'Produto não encontrado');
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) throw new HttpError(404, 'Produto não encontrado');
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
