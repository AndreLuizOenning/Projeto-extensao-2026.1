import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

const schema = z.object({
  nome: z.string().min(1), razao_social: z.string().optional(), cnpj: z.string().min(14), categoria: z.string().optional(),
  cep: z.string().optional(), pais: z.string().optional(), estado: z.string().optional(), cidade: z.string().optional(), rua: z.string().optional(), descricao: z.string().optional(), status: z.string().optional()
});
const updateSchema = schema.partial();

export default makeCrudRouter({ express, db, table: 'empresas', schema, updateSchema, listFilter: (q, f) => {
  if (f.nome) q.whereILike('nome', `%${f.nome}%`);
  return q;
}});
