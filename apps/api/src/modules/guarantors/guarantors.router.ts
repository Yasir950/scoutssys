import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/ApiResponse';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const guarantors = await prisma.guarantor.findMany({
      include: { issuedItems: { include: { scout: true, inventoryItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
    ApiResponse.success(res, guarantors, 'Guarantors retrieved');
  } catch (err) { next(err); }
});

router.post('/:id/release', async (req, res, next) => {
  try {
    const guarantor = await prisma.guarantor.update({
      where: { id: req.params['id']! },
      data: { releasedAt: new Date() },
    });
    ApiResponse.success(res, guarantor, 'Guarantor released');
  } catch (err) { next(err); }
});

export { router as guarantorsRouter };
