import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

// saldo_inicial é aceito do frontend mas convertido para saldo_atual no insert
// (a coluna saldo_inicial no banco é opcional — criada pela migration 003)
const createSchema = z.object({
  empresa_id: z.coerce.number().int().positive(),
  banco_id: z.coerce.number().int().positive(),
  agencia: z.string().min(1).max(50),
  numero_conta: z.string().min(1).max(50),
  digito: z.string().max(20).optional(),
  tipo_conta: z.enum(['CORRENTE', 'POUPANCA']).optional(),
  saldo_inicial: z.coerce.number().optional().default(0),
}).transform(({ saldo_inicial, ...rest }) => ({
  ...rest,
  saldo_atual: saldo_inicial ?? 0,
}));

const updateSchema = z.object({
  empresa_id: z.coerce.number().int().positive(),
  banco_id: z.coerce.number().int().positive(),
  agencia: z.string().min(1).max(50),
  numero_conta: z.string().min(1).max(50),
  digito: z.string().max(20).optional(),
  tipo_conta: z.enum(['CORRENTE', 'POUPANCA']).optional(),
}).partial();

export default makeCrudRouter({
  express,
  db,
  table: 'contas_bancarias',
  schema: createSchema,
  updateSchema,
  listFilter: (q, f) => {
    if (f.empresa_id) q.where('empresa_id', f.empresa_id);
    return q;
  },
});
