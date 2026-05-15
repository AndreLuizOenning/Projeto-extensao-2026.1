import { z } from 'zod';
import { AppError } from './AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export function makeCrudRouter({ express, db, table, schema, updateSchema, listFilter }) {
  const router = express.Router();

  router.get('/', asyncHandler(async (req, res) => {
    let query = db(table).where({ ativo: true });
    if (listFilter) query = listFilter(query, req.query);
    const rows = await query.orderBy('id', 'desc');
    res.json(rows);
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const row = await db(table).where({ id: req.params.id }).first();
    if (!row) throw new AppError('Registro não encontrado.', 404);
    res.json(row);
  }));

  router.post('/', asyncHandler(async (req, res) => {
    const data = schema.parse(req.body);
    const [created] = await db(table).insert(data).returning('*');
    res.status(201).json(created);
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const [updated] = await db(table)
      .where({ id: req.params.id, ativo: true })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    if (!updated) throw new AppError('Registro não encontrado.', 404);
    res.json(updated);
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    const [updated] = await db(table)
      .where({ id: req.params.id, ativo: true })
      .update({ ativo: false, updated_at: db.fn.now() })
      .returning('*');
    if (!updated) throw new AppError('Registro não encontrado.', 404);
    res.json({ message: 'Registro inativado com sucesso.' });
  }));

  return router;
}

export const statusTitulo = z.enum(['PENDENTE', 'PARCIAL', 'RECEBIDO', 'PAGO', 'CANCELADO']);
