import jwt from 'jsonwebtoken';

export function ensureAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token não informado.' });

  const [, token] = header.split(' ');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido.' });
  }
}
