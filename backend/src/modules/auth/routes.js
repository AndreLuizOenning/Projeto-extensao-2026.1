import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const body = z.object({ cpf: z.string().min(11), senha: z.string().min(1) }).parse(req.body);
  const cpf = body.cpf.replace(/\D/g, '');
  const user = await db('users').where({ cpf, ativo: true }).first();
  if (!user) throw new AppError('Credenciais inválidas.', 401);

  const ok = await bcrypt.compare(body.senha, user.password_hash);
  if (!ok) throw new AppError('Credenciais inválidas.', 401);

  const token = jwt.sign({ sub: user.id, role: user.role, nome: user.nome }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, nome: user.nome, role: user.role, cpf: user.cpf } });
}));

export default router;
