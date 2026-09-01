import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from './jwt';
import prisma from './prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: Role[];
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive account' });
    }
    req.user = { id: user.id, email: user.email, roles: user.roles };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const payload = verifyToken(header.slice(7));
    req.user = { id: payload.userId, email: payload.email, roles: payload.roles };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.some((r) => req.user!.roles.includes(r))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
