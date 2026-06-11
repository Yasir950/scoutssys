import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../lib/prisma';
import { redis, CACHE_KEYS } from '../../lib/redis';
import { env } from '../../lib/env';
import { AppError } from '../../utils/AppError';
import { TokenPayload, AuthTokens } from '@scouts/shared';

export class AuthService {
  static async login(email: string, password: string): Promise<{ tokens: AuthTokens; refreshToken: string; user: { id: string; name: string; email: string; role: string } }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const jti = uuidv4();
    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role as TokenPayload['role'], jti };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
    const refreshToken = jwt.sign({ sub: user.id, jti: uuidv4() }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    return {
      tokens: { accessToken },
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  static async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string; jti: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as typeof payload;
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401, 'UNAUTHORIZED');
    }

    const jti = uuidv4();
    const tokenPayload: TokenPayload = { sub: user.id, email: user.email, role: user.role as TokenPayload['role'], jti };
    const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    return { accessToken };
  }

  static async logout(jti: string): Promise<void> {
    const ttlSeconds = 15 * 60;
    await redis.setex(CACHE_KEYS.jwtBlacklist(jti), ttlSeconds, '1');
  }
}
