import 'dotenv/config';
import express from 'express';
import authRoutes from './modules/auth/routes.js';
import empresasRoutes from './modules/empresas/routes.js';
import bancosRoutes from './modules/bancos/routes.js';
import contasRoutes from './modules/contas-bancarias/routes.js';
import entidadesRoutes from './modules/entidades/routes.js';
import categoriasRoutes from './modules/categorias/routes.js';
import centrosRoutes from './modules/centros-custo/routes.js';
import titulosRoutes from './modules/titulos/routes.js';
import conciliacaoRoutes from './modules/conciliacao/routes.js';
import iaRoutes from './modules/ia/routes.js';
import { ensureAuth } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';


if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou fraco. Defina JWT_SECRET com pelo menos 32 caracteres.');
}

const app = express();


const parseCorsOrigins = (rawOrigins) => {
  if (!rawOrigins) return [];

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:8080'];
const envOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
const corsAllowedOrigins = envOrigins.length > 0
  ? envOrigins
  : (process.env.NODE_ENV === 'development' ? defaultDevOrigins : []);

const corsMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const corsAllowedHeaders = ['Content-Type', 'Authorization'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isOriginAllowed = !origin || corsAllowedOrigins.includes(origin);

  if (isOriginAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Methods', corsMethods.join(','));
  res.header('Access-Control-Allow-Headers', corsAllowedHeaders.join(','));

  if (req.method === 'OPTIONS') {
    return res.sendStatus(isOriginAllowed ? 204 : 403);
  }

  if (!isOriginAllowed) {
    return res.status(403).json({ message: 'Origin não permitida por CORS' });
  }

  return next();
});
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);

app.use(ensureAuth);
app.use('/empresas', empresasRoutes);
app.use('/bancos', bancosRoutes);
app.use('/contas-bancarias', contasRoutes);
app.use('/entidades', entidadesRoutes);
app.use('/categorias-financeiras', categoriasRoutes);
app.use('/centros-custo', centrosRoutes);
app.use('/titulos', titulosRoutes);
app.use('/conciliacoes', conciliacaoRoutes);
app.use('/ia', iaRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API running on :${port}`));
