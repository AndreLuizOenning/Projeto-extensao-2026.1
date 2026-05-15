import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

const schema = z.object({ nome: z.string().min(1), tipo: z.enum(['DESPESA', 'RECEITA']) });
const updateSchema = schema.partial();

export default makeCrudRouter({ express, db, table: 'categorias_financeiras', schema, updateSchema });
