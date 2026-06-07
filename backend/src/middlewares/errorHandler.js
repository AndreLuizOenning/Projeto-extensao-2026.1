import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({ error: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: err.flatten() });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Violação de unicidade do PostgreSQL (ex: nome+tipo duplicados)
  if (err.code === '23505') {
    return res.status(422).json({ error: 'DUPLICATE_ERROR', message: 'Já existe um registro com esses dados.' });
  }

  // Violação de chave estrangeira
  if (err.code === '23503') {
    return res.status(422).json({ error: 'FOREIGN_KEY_ERROR', message: 'Referência inválida: registro relacionado não encontrado.' });
  }

  // Violação de NOT NULL
  if (err.code === '23502') {
    return res.status(422).json({ error: 'NOT_NULL_ERROR', message: `Campo obrigatório ausente: ${err.column || ''}`.trim() });
  }

  console.error(err);
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' });
}
