import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

const createSchema = z.object({
  empresa_id: z.coerce.number().int().positive(),
  banco_id: z.coerce.number().int().positive(),
  agencia: z.string().min(1),
  numero_conta: z.string().min(1),
  digito: z.string().optional(),
  tipo_conta: z.enum(['CORRENTE', 'POUPANCA']).optional(),
  saldo_inicial: z.coerce.number().optional().default(0),
}).transform((data) => ({
  ...data,
  saldo_atual: data.saldo_inicial ?? 0,
}));

const updateSchema = z.object({
  empresa_id: z.coerce.number().int().positive(),
  banco_id: z.coerce.number().int().positive(),
  agencia: z.string().min(1),
  numero_conta: z.string().min(1),
  digito: z.string().optional(),
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
