import jwt from 'jsonwebtoken';

export function getGraphQLContext(req) {
  const header = (req.get('authorization') || req.get('Authorization') || '').trim();

  if (!header || !header.startsWith('Bearer ')) {
    return { user: null, authError: 'Token no proporcionado' };
  }

  const token = header.slice('Bearer '.length).trim();

  if (!token) {
    return { user: null, authError: 'Token no proporcionado' };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { user, authError: null };
  } catch {
    return { user: null, authError: 'Token inválido' };
  }
}
