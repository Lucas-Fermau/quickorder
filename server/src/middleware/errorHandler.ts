import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Validação falhou',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, [v.message]])
      ),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code: number }).code === 11000
  ) {
    return res.status(409).json({ error: 'Recurso já existe' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}
