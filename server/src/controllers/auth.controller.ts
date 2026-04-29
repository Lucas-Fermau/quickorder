import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { HttpError } from '../middleware/errorHandler';
import { loginSchema, registerSchema } from '../schemas';

const BCRYPT_ROUNDS = 10;

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await User.findOne({ email: data.email });
      if (existing) throw new HttpError(409, 'Email já cadastrado');

      const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: passwordHash,
      });

      const token = signToken({ userId: user.id, role: user.role });
      res.status(201).json({ user: user.toJSON(), token });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const user = await User.findOne({ email: data.email }).select('+password');
      if (!user) throw new HttpError(401, 'Credenciais inválidas');

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) throw new HttpError(401, 'Credenciais inválidas');

      const token = signToken({ userId: user.id, role: user.role });
      res.json({ user: user.toJSON(), token });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.userId);
      if (!user) throw new HttpError(404, 'Usuário não encontrado');
      res.json({ user: user.toJSON() });
    } catch (err) {
      next(err);
    }
  },
};
