import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { HttpError } from '../middleware/errorHandler';
import {
  createOrderSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from '../schemas';
import { applyCoupon } from '../utils/coupons';

const orderInclude = {
  items: true,
  user: { select: { id: true, name: true, email: true } },
} as const;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function shapeOrder(o: OrderWithRelations) {
  const { street, number, complement, neighborhood, city, zipCode, ...rest } = o;
  return {
    ...rest,
    address: { street, number, complement, neighborhood, city, zipCode },
  };
}

function shapeMany(orders: OrderWithRelations[]) {
  return orders.map(shapeOrder);
}

export const ordersController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createOrderSchema.parse(req.body);
      const productIds = data.items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new HttpError(400, 'Algum produto do pedido não existe');
      }
      const unavailable = products.find((p) => !p.available);
      if (unavailable) {
        throw new HttpError(400, `Produto indisponível: ${unavailable.name}`);
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      const items = data.items.map((i) => {
        const p = productMap.get(i.productId)!;
        return {
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: i.quantity,
          imageUrl: p.imageUrl,
        };
      });

      const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      let discount = 0;
      let couponCode: string | undefined;
      if (data.couponCode) {
        const coupon = applyCoupon(data.couponCode, total);
        if (!coupon) throw new HttpError(400, 'Cupom inválido');
        discount = coupon.discount;
        couponCode = coupon.code;
      }
      const finalTotal = Math.max(0, total - discount);

      const order = await prisma.order.create({
        data: {
          userId: req.userId!,
          total: Math.round(total * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          finalTotal: Math.round(finalTotal * 100) / 100,
          paymentMethod: data.paymentMethod,
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          zipCode: data.address.zipCode,
          notes: data.notes,
          couponCode,
          status: 'pending',
          items: { create: items },
        },
        include: orderInclude,
      });

      res.status(201).json({ order: shapeOrder(order) });
    } catch (err) {
      next(err);
    }
  },

  async myOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      });
      res.json({ orders: shapeMany(orders) });
    } catch (err) {
      next(err);
    }
  },

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = orderListQuerySchema.parse(req.query);
      const where: Prisma.OrderWhereInput = {};
      if (query.status) where.status = query.status;
      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      });
      res.json({ orders: shapeMany(orders) });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: orderInclude,
      });
      if (!order) throw new HttpError(404, 'Pedido não encontrado');
      if (req.userRole !== 'admin' && order.userId !== req.userId) {
        throw new HttpError(403, 'Acesso negado');
      }
      res.json({ order: shapeOrder(order) });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateOrderStatusSchema.parse(req.body);
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: { status: data.status },
        include: orderInclude,
      });
      res.json({ order: shapeOrder(order) });
    } catch (err) {
      next(err);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalOrders, pendingOrders, totalProducts, sumAgg] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.product.count(),
        prisma.order.aggregate({
          where: { status: { not: 'cancelled' } },
          _sum: { finalTotal: true },
        }),
      ]);
      const totalSold = sumAgg._sum.finalTotal ?? 0;
      res.json({
        totalOrders,
        pendingOrders,
        totalSold: Math.round(totalSold * 100) / 100,
        totalProducts,
      });
    } catch (err) {
      next(err);
    }
  },
};
