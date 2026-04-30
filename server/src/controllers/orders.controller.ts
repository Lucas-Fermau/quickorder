import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { HttpError } from '../middleware/errorHandler';
import {
  createOrderSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from '../schemas';
import { applyCoupon } from '../utils/coupons';

export const ordersController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createOrderSchema.parse(req.body);
      const productIds = data.items.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds } });

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
          productId: p._id,
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

      const order = await Order.create({
        userId: req.userId,
        items,
        total: Math.round(total * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
        paymentMethod: data.paymentMethod,
        address: data.address,
        notes: data.notes,
        couponCode,
        status: 'pending',
      });

      res.status(201).json({ order });
    } catch (err) {
      next(err);
    }
  },

  async myOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = orderListQuerySchema.parse(req.query);
      const filter: Record<string, unknown> = {};
      if (query.status) filter.status = query.status;
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await Order.findById(req.params.id).populate('userId', 'name email');
      if (!order) throw new HttpError(404, 'Pedido não encontrado');
      const ownerId = (order.userId as unknown as { _id: { toString(): string } })._id.toString();
      if (req.userRole !== 'admin' && ownerId !== req.userId) {
        throw new HttpError(403, 'Acesso negado');
      }
      res.json({ order });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateOrderStatusSchema.parse(req.body);
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: data.status },
        { new: true, runValidators: true }
      );
      if (!order) throw new HttpError(404, 'Pedido não encontrado');
      res.json({ order });
    } catch (err) {
      next(err);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [total, pending, totalProducts, sumAgg] = await Promise.all([
        Order.countDocuments({}),
        Order.countDocuments({ status: 'pending' }),
        Product.countDocuments({}),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$finalTotal' } } },
        ]),
      ]);
      const totalSold: number = sumAgg[0]?.total ?? 0;
      res.json({
        totalOrders: total,
        pendingOrders: pending,
        totalSold: Math.round(totalSold * 100) / 100,
        totalProducts,
      });
    } catch (err) {
      next(err);
    }
  },
};
