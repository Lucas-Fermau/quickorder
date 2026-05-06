import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
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
      const where: Prisma.ProductWhereInput = {};
      if (query.category) where.category = query.category;
      if (query.featured !== undefined) where.featured = query.featured;
      if (query.available !== undefined) where.available = query.available;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      const products = await prisma.product.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      });
      res.json({ products });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!product) throw new HttpError(404, 'Produto não encontrado');
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productSchema.parse(req.body);
      const product = await prisma.product.create({ data });
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productUpdateSchema.parse(req.body);
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data,
      });
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
