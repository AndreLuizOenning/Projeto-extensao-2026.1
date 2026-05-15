import express from 'express';
import { z } from 'zod';
import db from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const body = z.object({ conta_bancaria_id: z.coerce.number().int().positive(), data_referencia: z.string(), saldo_extrato: z.coerce.number(), observacao: z.string().optional() }).parse(req.body);
  const conta = await db('contas_bancarias').where({ id: body.conta_bancaria_id, ativo: true }).first();
  if (!conta) throw new AppError('Conta bancária não encontrada.', 404);

  const saldoSistema = Number(conta.saldo_atual);
  const diferenca = Number(body.saldo_extrato) - saldoSistema;
  const status = diferenca === 0 ? 'CONCILIADO' : 'DIVERGENTE';

  const [conc] = await db('conciliacoes_bancarias').insert({
    conta_bancaria_id: body.conta_bancaria_id,
    data_referencia: body.data_referencia,
    saldo_extrato: body.saldo_extrato,
    saldo_sistema: saldoSistema,
    diferenca,
    status,
    observacao: body.observacao,
    created_by: req.user?.sub || null
  }).returning('*');

  res.status(201).json(conc);
}));

export default router;
