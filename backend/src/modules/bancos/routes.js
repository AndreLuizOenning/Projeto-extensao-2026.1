import express from 'express';
import db from '../../config/db.js';
import { z } from 'zod';
import { makeCrudRouter } from '../../utils/crudFactory.js';

const schema = z.object({ codigo: z.string().min(1), nome: z.string().min(1) });
const updateSchema = schema.partial();

export default makeCrudRouter({ express, db, table: 'bancos', schema, updateSchema });
