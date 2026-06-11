import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export function auditLog(action: AuditAction, resource: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (req.user && (res.statusCode < 400)) {
        const resourceId =
          req.params['id'] ??
          (body && typeof body === 'object' && 'data' in body && body.data && typeof body.data === 'object' && 'id' in body.data
            ? String((body.data as { id: unknown }).id)
            : undefined);

        prisma.auditLog
          .create({
            data: {
              userId: req.user.sub,
              action,
              resource,
              resourceId: resourceId ?? null,
              ipAddress: req.ip ?? null,
              userAgent: req.headers['user-agent'] ?? null,
            },
          })
          .catch((err) => logger.error('Audit log failed', { err }));
      }
      return originalJson(body);
    };
    next();
  };
}
