import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { signToken } from '../utils/jwt';
import { HttpError } from '../middleware/errorHandler';
import { loginSchema, registerSchema } from '../schemas';

const BCRYPT_ROUNDS = 10;

function publicUser(user: { id: string; email: string; name: string; role: 'customer' | 'admin'; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new HttpError(409, 'Email já cadastrado');

      const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
      const user = await prisma.user.create({
        data: { name: data.name, email: data.email, password: passwordHash },
      });

      const token = signToken({ userId: user.id, role: user.role });
      res.status(201).json({ user: publicUser(user), token });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) throw new HttpError(401, 'Credenciais inválidas');

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) throw new HttpError(401, 'Credenciais inválidas');

      const token = signToken({ userId: user.id, role: user.role });
      res.json({ user: publicUser(user), token });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) throw new HttpError(404, 'Usuário não encontrado');
      res.json({ user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  },
};
