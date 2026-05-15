import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

const schema = z.object({ empresa_id: z.coerce.number().int().positive(), codigo: z.string().min(1), nome: z.string().min(1) });
const updateSchema = schema.partial();

export default makeCrudRouter({ express, db, table: 'centros_custo', schema, updateSchema, listFilter: (q, f) => {
  if (f.empresa_id) q.where('empresa_id', f.empresa_id);
  return q;
}});
