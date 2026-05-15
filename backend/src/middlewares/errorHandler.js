import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: err.flatten() });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' });
}
