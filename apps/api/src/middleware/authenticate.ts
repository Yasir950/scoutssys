import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';
import { redis, CACHE_KEYS } from '../lib/redis';
import { AppError } from '../utils/AppError';
import { TokenPayload } from '@scouts/shared';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    const isBlacklisted = await redis.exists(CACHE_KEYS.jwtBlacklist(payload.jti));
    if (isBlacklisted) {
      throw new AppError('Token has been invalidated', 401, 'TOKEN_REVOKED');
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
  }
}
