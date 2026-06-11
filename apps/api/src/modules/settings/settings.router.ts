import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/ApiResponse';

const router = Router();
router.use(authenticate);

router.get('/', SettingsController.getAll);
router.put('/', authorize(['ADMIN']), SettingsController.update);
router.put('/bulk', authorize(['ADMIN']), SettingsController.updateBulk);

router.get('/audit', authorize(['ADMIN']), async (req, res, next) => {
  try {
    const page = Number(req.query['page'] ?? 1);
    const limit = Math.min(Number(req.query['limit'] ?? 25), 100);
    const skip = (page - 1) * limit;
    const action = req.query['action'] as string | undefined;
    const search = req.query['search'] as string | undefined;

    const where = {
      ...(action ? { action } : {}),
      ...(search ? {
        OR: [
          { entity: { contains: search, mode: 'insensitive' as const } },
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    ApiResponse.success(res, logs, 'Audit logs retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

export { router as settingsRouter };
