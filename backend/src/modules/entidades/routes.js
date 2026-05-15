import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

const schema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(['Cliente', 'Fornecedor', 'Funcionário', 'Parceiro']),
  empresa_id: z.coerce.number().int().positive().nullable().optional(),
  contato: z.string().optional(),
  status: z.string().optional(),
  cnpj_cpf: z.string().optional(),
  endereco: z.string().optional()
});
const updateSchema = schema.partial();

export default makeCrudRouter({ express, db, table: 'entidades', schema, updateSchema });
